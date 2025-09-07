import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { RuleForm } from "@/components/rules/RuleForm";
import { RuleList, type Rule } from "@/components/rules/RuleList";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Joyride, { type Step, type CallBackProps } from "react-joyride";
import { defaultRules } from "@/lib/defaultRules";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const SettingsPage = () => {
  const { user } = useAuth();
  const [rules, setRules] = useState<Rule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [runTour, setRunTour] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [ruleToEdit, setRuleToEdit] = useState<Rule | null>(null);

  const tourSteps: Step[] = [
    {
      target: "#tour-step-1",
      content:
        "First, choose the emotion that will act as the trigger for your rule.",
      disableBeacon: true,
      placement: "bottom",
    },
    {
      target: "#tour-step-2",
      content: "Next, select the action you want the application to perform.",
      placement: "bottom",
    },
    {
      target: "#tour-step-3",
      content:
        "Finally, provide the value for the action, like a file path on your laptop or a message to be spoken.",
      placement: "bottom",
    },
    {
      target: "#tour-step-4",
      content:
        "Click here to save your new rule. You can add as many as you like!",
      placement: "top",
    },
  ];

  const fetchRules = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    const { data, error } = await supabase
      .from("user_rules")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    if (error) {
      toast.error("Could not fetch your rules.");
      console.error("Error fetching rules:", error);
    } else {
      setRules(data);
      if (data.length === 0) {
        setTimeout(() => setRunTour(true), 500);
      }
    }
    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  const handleCopyToMySettings = async () => {
    if (!user) return;
    setIsCopying(true);
    const rulesToInsert = defaultRules.map((rule) => ({
      ...rule,
      user_id: user.id,
    }));
    const { error } = await supabase.from("user_rules").insert(rulesToInsert);

    if (error) {
      toast.error("Failed to copy default settings.");
      console.error(error);
    } else {
      toast.success("Default settings have been copied to your account!");
      await fetchRules();
    }
    setIsCopying(false);
  };

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    const finishedStatuses: string[] = ["finished", "skipped"];
    if (finishedStatuses.includes(status)) {
      setRunTour(false);
    }
  };

  const handleEditRule = (rule: Rule) => {
    setRuleToEdit(rule);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleFinishEditing = () => {
    setRuleToEdit(null);
  };

  return (
    <div className="space-y-6">
      <Joyride
        steps={tourSteps}
        run={runTour}
        callback={handleJoyrideCallback}
        continuous
        showProgress
        showSkipButton
        styles={{ options: { primaryColor: "#8884d8", zIndex: 1000 } }}
      />

      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your application settings and define your action rules.
        </p>
      </div>
      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Rules Engine</CardTitle>
          <CardDescription>
            Tell WellnessHub how to respond to your emotions. You can add your
            own custom rules, or start by copying our recommended defaults and
            editing them.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RuleForm
            onRuleChange={fetchRules}
            ruleToEdit={ruleToEdit}
            onFinishEditing={handleFinishEditing}
          />
          <Separator className="my-6" />
          <h3 className="text-lg font-medium">Your Rules</h3>

          {isLoading ? (
            <div className="space-y-3 mt-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : rules.length > 0 ? (
            <RuleList
              rules={rules}
              onRuleChange={fetchRules}
              onEditRule={handleEditRule}
            />
          ) : (
            <div className="text-center md:text-left">
              <p className="text-sm text-muted-foreground mb-4">
                You haven't set up any custom rules yet. Here are our
                recommended defaults to get you started.
              </p>
              {/* UPDATED: Pass empty functions for both handlers for full read-only mode */}
              <RuleList
                rules={defaultRules.map((r, i) => ({ ...r, id: i }))}
                onRuleChange={() => {}}
                onEditRule={() => {}}
              />
              <Button
                onClick={handleCopyToMySettings}
                disabled={isCopying}
                className="mt-6"
              >
                {isCopying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Copy Defaults to My Settings & Edit
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;
