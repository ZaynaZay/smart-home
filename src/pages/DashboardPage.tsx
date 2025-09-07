import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Camera,
  CameraOff,
  Smile,
  BarChart3,
  Loader2,
  Download,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { supabase } from "@/lib/supabaseClient";
import { WellnessTipCard } from "@/components/WellnessTipCard";
import { EmotionalWeatherCard } from "@/components/EmotionalWeatherCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Papa from "papaparse";
import { toast } from "sonner";

// Define a type for our chart data for type safety
type EmotionLog = {
  created_at: string;
  emotion: string;
};

// --- CHART HELPER DATA ---
const emotionToValue: { [key: string]: number } = {
  happy: 8,
  surprise: 7,
  neutral: 5,
  unknown: 4,
  sad: 3,
  fear: 2,
  angry: 1,
  disgust: 0,
};
const valueToEmotion: { [key: number]: string } = {
  8: "Happy",
  7: "Surprise",
  5: "Neutral",
  4: "Unknown",
  3: "Sad",
  2: "Fear",
  1: "Angry",
  0: "Disgust",
};

const DashboardPage = () => {
  // --- STATE & REFS ---
  const { user } = useAuth();
  const [userName, setUserName] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [finalEmotion, setFinalEmotion] = useState("Neutral");
  const [analysisSource, setAnalysisSource] = useState<string | null>(null);
  const [emotionHistory, setEmotionHistory] = useState<EmotionLog[]>([]);
  const [timeRange, setTimeRange] = useState("day");

  const videoRef = useRef<HTMLVideoElement>(null);
  const analysisIntervalRef = useRef<number | null>(null);

  // --- DATA FETCHING ---
  useEffect(() => {
    const fetchInitialData = async () => {
      if (user) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .single();
        if (profileData) setUserName(profileData.full_name);

        const rangeInHours = timeRange === "day" ? 24 : 168;
        const { data: emotionData, error: emotionError } = await supabase
          .from("emotion_logs")
          .select("created_at, emotion")
          .eq("user_id", user.id)
          .gte(
            "created_at",
            new Date(Date.now() - rangeInHours * 60 * 60 * 1000).toISOString()
          )
          .order("created_at", { ascending: false })
          .limit(100);

        if (emotionError)
          console.error("Error fetching emotion logs:", emotionError);
        if (emotionData) setEmotionHistory(emotionData.reverse());
      }
    };
    fetchInitialData();
  }, [user, timeRange]);

  // --- COMPONENT CLEANUP ---
  useEffect(() => {
    return () => {
      if (analysisIntervalRef.current)
        clearInterval(analysisIntervalRef.current);
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // --- CORE LOGIC (UPDATED WITH SECURITY FIX) ---
  const analyzeFrame = async () => {
    if (!videoRef.current || videoRef.current.readyState < 3) return;
    setIsLoadingAnalysis(true);

    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const context = canvas.getContext("2d");
    if (!context) {
      setIsLoadingAnalysis(false);
      return;
    }
    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg");

    try {
      // 1. Get the current user session to obtain the secure access token.
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Authentication session not found. Please log in again.");
        throw new Error("User not authenticated.");
      }

      // 2. Make the API call, now including the secure Authorization header.
      const response = await fetch("http://127.0.0.1:8000/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`, // This line is the crucial fix.
        },
        body: JSON.stringify({ image: dataUrl }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          toast.error(
            "Authentication error. Your session may be invalid. Please log in again."
          );
        }
        throw new Error(`Backend error: ${response.status}`);
      }

      const result = await response.json();
      const detectedEmotion = result?.final_emotion ?? "unknown";

      // 3. Update the UI with the new, simpler response from the backend.
      setFinalEmotion(detectedEmotion);
      setAnalysisSource(result?.source ?? null);

      if (user && detectedEmotion !== "unknown") {
        const { error } = await supabase
          .from("emotion_logs")
          .insert([{ user_id: user.id, emotion: detectedEmotion }]);
        if (error) console.error("Error saving emotion log:", error);
        else {
          const newLog = {
            created_at: new Date().toISOString(),
            emotion: detectedEmotion,
          };
          setEmotionHistory((prev) => [...prev, newLog].slice(-100));
        }
      }
    } catch (error) {
      console.error("Analysis API call failed:", error);
    } finally {
      setIsLoadingAnalysis(false);
    }
  };

  const startCamera = async () => {
    if (isCameraActive || !navigator.mediaDevices?.getUserMedia) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          setIsCameraActive(true);
          analysisIntervalRef.current = window.setInterval(analyzeFrame, 5000);
        };
      }
    } catch (error) {
      console.error("Error accessing webcam:", error);
      alert("Could not access camera. Please check browser permissions.");
    }
  };

  const stopCamera = () => {
    if (!isCameraActive) return;
    if (analysisIntervalRef.current) clearInterval(analysisIntervalRef.current);
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
    }
    setIsCameraActive(false);
    setFinalEmotion("Neutral");
    setAnalysisSource(null);
  };

  const handleDownloadReport = () => {
    if (emotionHistory.length === 0) {
      toast.info("No emotion data to export.");
      return;
    }
    const csv = Papa.unparse(emotionHistory);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `wellness_report_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Report download started!");
  };

  const formatChartData = (data: EmotionLog[]) => {
    return data.map((log) => ({
      time: new Date(log.created_at).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      mood: emotionToValue[log.emotion.toLowerCase()] ?? 4,
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {userName || user?.email}! Here's your real-time
            wellness overview.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleDownloadReport}>
          <Download className="mr-2 h-4 w-4" />
          Download Report
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Live Emotion Detection</CardTitle>
                <CardDescription>
                  Your real-time wellness monitor.
                </CardDescription>
              </div>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  onClick={startCamera}
                  disabled={isCameraActive}
                >
                  <Camera className="h-4 w-4 mr-2" /> Start Camera
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={stopCamera}
                  disabled={!isCameraActive}
                >
                  <CameraOff className="h-4 w-4 mr-2" /> Stop Camera
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={
                    isCameraActive ? "w-full h-full object-cover" : "hidden"
                  }
                />
                {!isCameraActive && (
                  <div className="text-center text-muted-foreground">
                    <CameraOff className="h-12 w-12 mx-auto" />
                    <p>Camera is currently off</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" /> Your Emotion Trend
                </CardTitle>
                <CardDescription>
                  A live log of your detected emotions.
                </CardDescription>
              </div>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select time range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Last 24 Hours</SelectItem>
                  <SelectItem value="week">Last 7 Days</SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent className="h-80">
              {emotionHistory.length > 1 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={formatChartData(emotionHistory)}
                    margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis dataKey="mood" domain={[0, 10]} hide />
                    <Tooltip
                      formatter={(value: number) => [
                        `${valueToEmotion[value] ?? "Unknown"}`,
                        "Detected Mood",
                      ]}
                      labelFormatter={(label) => `Time: ${label}`}
                      contentStyle={{ borderRadius: "0.5rem" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="mood"
                      stroke="#8884d8"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-muted-foreground">
                    Start the camera to see your emotion history.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Smile className="h-5 w-5 mr-2" /> Current Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">
                  Final Detected Emotion
                </p>
                <div className="flex items-center justify-center h-16">
                  {isLoadingAnalysis ? (
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  ) : (
                    <p className="text-5xl font-bold capitalize">
                      {finalEmotion}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  {analysisSource ? `(Source: ${analysisSource})` : ""}
                </p>
              </div>
            </CardContent>
          </Card>

          <WellnessTipCard emotion={finalEmotion} />
          <EmotionalWeatherCard />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
