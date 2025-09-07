import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Pencil, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

export type Rule = {
  id: number;
  emotion: string;
  action: string;
  payload: string;
  is_enabled: boolean;
};

interface RuleListProps {
  rules: Rule[];
  onRuleChange?: () => void;
  onEditRule?: (rule: Rule) => void;
}

export const RuleList = ({
  rules,
  onRuleChange,
  onEditRule,
}: RuleListProps) => {
  const isReadOnly = !onRuleChange || !onEditRule;

  const handleDelete = async (id: number) => {
    if (
      isReadOnly ||
      !window.confirm("Are you sure you want to delete this rule?")
    )
      return;
    const { error } = await supabase.from("user_rules").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Rule deleted successfully.");
      onRuleChange();
    }
  };

  const handleToggle = async (id: number, currentState: boolean) => {
    if (isReadOnly) return;
    const { error } = await supabase
      .from("user_rules")
      .update({ is_enabled: !currentState })
      .eq("id", id);
    if (error) toast.error(error.message);
    else onRuleChange();
  };

  if (rules.length === 0) return null;

  return (
    <div className="mt-6 border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Enabled</TableHead>
            <TableHead>Emotion</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Value</TableHead>
            <TableHead className="w-[120px] text-right">Manage</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rules.map((rule) => (
            <TableRow key={rule.id}>
              <TableCell>
                <Switch
                  checked={rule.is_enabled}
                  onCheckedChange={() => handleToggle(rule.id, rule.is_enabled)}
                  disabled={isReadOnly}
                />
              </TableCell>
              <TableCell className="capitalize font-medium">
                {rule.emotion}
              </TableCell>
              <TableCell className="capitalize text-muted-foreground">
                {rule.action.replace(/_/g, " ")}
              </TableCell>
              <TableCell>
                <code className="bg-muted px-2 py-1 rounded text-sm font-mono">
                  {rule.payload}
                </code>
              </TableCell>
              <TableCell className="text-right space-x-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    if (onEditRule) onEditRule(rule);
                  }}
                  disabled={isReadOnly}
                >
                  <Pencil className="h-4 w-4 text-muted-foreground" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(rule.id)}
                  disabled={isReadOnly}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
