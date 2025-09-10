import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { BrainCircuit, SlidersHorizontal, Download } from "lucide-react";
import { toast } from "sonner";

const OnboardingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCompleteOnboarding = async () => {
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({ has_completed_onboarding: true })
      .eq("id", user.id);

    if (error) {
      toast.error("Could not complete setup. Please try again.");
      console.error(error);
    } else {
      navigate("/dashboard"); // All done, go to the main app!
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold">Welcome to EmotiHome!</h1>
        <p className="text-muted-foreground mt-2">
          Let's get you set up in a few simple steps.
        </p>
      </div>

      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BrainCircuit className="mr-2 h-6 w-6 text-primary" />
              Step 1: How It Works
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              EmotiHome uses your camera to privately analyze your emotion.
              Based on your feelings, it can automatically adjust your laptop's
              environment (like changing the wallpaper or music) to help improve
              your mood and focus.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <SlidersHorizontal className="mr-2 h-6 w-6 text-primary" />
              Step 2: Create Your First Rule
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Let's create a simple rule. For example, when you feel sad, the
              app can play some uplifting music. You can change this and add
              many more rules later in the <strong>Settings</strong> page.
            </p>
            <Button onClick={() => navigate("/settings")}>
              Go to Settings
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Download className="mr-2 h-6 w-6 text-primary" />
              Step 3: The Local Agent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              The Local Agent is a small, secure script that runs on your
              computer to perform the actions you define. Instructions for
              setting it up are in the "Next Steps" card on your dashboard.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Once you've set up a rule and understand the Local Agent, you're
              ready to go!
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="text-center mt-12">
        <Button size="lg" onClick={handleCompleteOnboarding}>
          Finish Setup & Go to Dashboard
        </Button>
      </div>
    </div>
  );
};

export default OnboardingPage;
