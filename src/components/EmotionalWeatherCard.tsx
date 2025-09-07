import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cloud, TrendingUp, Sparkles, AlertTriangle } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { Skeleton } from "@/components/ui/skeleton";

// Define a type for the data we expect from our new database function
type EmotionSummary = {
  dominant_emotion: string | null;
  total_logs: number | null;
};

// A helper to generate a friendly message and select an icon
const generateInsight = (summary: EmotionSummary) => {
  if (
    !summary.dominant_emotion ||
    !summary.total_logs ||
    summary.total_logs < 5
  ) {
    return {
      icon: <Cloud className="h-5 w-5 mr-2 text-blue-500" />,
      message:
        "Start using the app to discover trends in your emotional well-being.",
    };
  }

  const emotion = summary.dominant_emotion;
  let message = `Your dominant emotion this week has been `;
  let icon = <TrendingUp className="h-5 w-5 mr-2 text-gray-500" />;

  switch (emotion) {
    case "happy":
    case "surprise":
      message += `<strong>${emotion}</strong>. You're maintaining a positive outlook!`;
      icon = <Sparkles className="h-5 w-5 mr-2 text-yellow-500" />;
      break;
    case "sad":
    case "angry":
    case "fear":
      message += `<strong>${emotion}</strong>. Remember to be kind to yourself.`;
      icon = <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />;
      break;
    default: // neutral
      message += `<strong>${emotion}</strong>. You've kept a great sense of balance.`;
      icon = <TrendingUp className="h-5 w-5 mr-2 text-green-500" />;
      break;
  }
  return { icon, message };
};

export const EmotionalWeatherCard = () => {
  const [summary, setSummary] = useState<EmotionSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      setIsLoading(true);
      // "rpc" stands for Remote Procedure Call, which is how we call database functions.
      const { data, error } = await supabase.rpc("get_emotion_summary");

      if (error) {
        console.error("Error fetching emotion summary:", error);
      } else {
        setSummary(data);
      }
      setIsLoading(false);
    };

    fetchSummary();
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Cloud className="h-5 w-5 mr-2" />
            Weekly Insight
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </CardContent>
      </Card>
    );
  }

  if (!summary) return null; // Don't render the card if there was an error

  const { icon, message } = generateInsight(summary);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          {icon}Weekly Insight
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Use dangerouslySetInnerHTML to render the <strong> tag */}
        <p
          className="text-sm text-muted-foreground"
          dangerouslySetInnerHTML={{ __html: message }}
        />
      </CardContent>
    </Card>
  );
};
