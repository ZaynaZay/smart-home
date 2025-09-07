import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb } from "lucide-react";
import { wellnessTips } from "@/lib/wellnessTips";
import { useMemo } from "react";

interface WellnessTipCardProps {
  emotion: string;
}

export const WellnessTipCard = ({ emotion }: WellnessTipCardProps) => {
  // useMemo ensures we only pick a new random tip when the emotion changes, not on every re-render.
  const tip = useMemo(() => {
    const emotionKey = emotion.toLowerCase();
    const tipsForEmotion = wellnessTips[emotionKey] || wellnessTips["default"];
    const randomIndex = Math.floor(Math.random() * tipsForEmotion.length);
    return tipsForEmotion[randomIndex];
  }, [emotion]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Lightbulb className="h-5 w-5 mr-2 text-yellow-500" />
          Wellness Tip
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground italic">"{tip}"</p>
      </CardContent>
    </Card>
  );
};
