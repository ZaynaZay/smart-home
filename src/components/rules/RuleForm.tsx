import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import type { Rule } from "./RuleList";

const formSchema = z.object({
  emotion: z.string().min(1, { message: "Please select an emotion." }),
  action: z.string().min(1, { message: "Please select an action." }),
  payload: z
    .string()
    .min(1, { message: "Please provide a value for the action." }),
});

const emotions = ["Happy", "Sad", "Angry", "Surprise", "Fear", "Neutral"];
const actions = [
  { value: "play_music", label: "Play Music (File Path)" },
  { value: "change_wallpaper", label: "Change Wallpaper (Image Path)" },
  { value: "speak", label: "Text-to-Speech (Message)" },
];

interface RuleFormProps {
  onRuleChange: () => void;
  ruleToEdit: Rule | null;
  onFinishEditing: () => void;
}

export const RuleForm = ({
  onRuleChange,
  ruleToEdit,
  onFinishEditing,
}: RuleFormProps) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = !!ruleToEdit;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { emotion: "", action: "", payload: "" },
  });

  useEffect(() => {
    if (ruleToEdit) {
      form.setValue("emotion", ruleToEdit.emotion);
      form.setValue("action", ruleToEdit.action);
      form.setValue("payload", ruleToEdit.payload);
    } else {
      form.reset({ emotion: "", action: "", payload: "" });
    }
  }, [ruleToEdit, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) return;
    setIsSubmitting(true);

    if (isEditMode && ruleToEdit) {
      const { error } = await supabase
        .from("user_rules")
        .update({ ...values })
        .eq("id", ruleToEdit.id);
      if (error) toast.error(error.message);
      else toast.success("Rule updated successfully!");
    } else {
      const { error } = await supabase
        .from("user_rules")
        .insert([{ ...values, user_id: user.id }]);
      if (error) toast.error(error.message);
      else toast.success("New rule created successfully!");
    }

    setIsSubmitting(false);
    onFinishEditing();
    onRuleChange();
  }

  return (
    <Form {...form}>
      <h3 className="text-lg font-medium mb-4">
        {isEditMode ? "Edit Rule" : "Add a New Rule"}
      </h3>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="emotion"
            render={({ field }) => (
              <FormItem>
                <FormLabel>When Emotion Is</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger id="tour-step-1">
                      <SelectValue placeholder="Select an emotion" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {emotions.map((e) => (
                      <SelectItem key={e} value={e.toLowerCase()}>
                        {e}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="action"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Perform Action</FormLabel>
                {/* --- THE FIX IS HERE --- */}
                {/* Changed 'onValuechange' to the correct 'onValueChange' */}
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger id="tour-step-2">
                      <SelectValue placeholder="Select an action" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {actions.map((a) => (
                      <SelectItem key={a.value} value={a.value}>
                        {a.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="payload"
            render={({ field }) => (
              <FormItem>
                <FormLabel>With Value</FormLabel>
                <FormControl>
                  <Input
                    id="tour-step-3"
                    placeholder="/path/to/file or message"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex items-center space-x-2">
          <Button type="submit" id="tour-step-4" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditMode ? "Save Changes" : "Add Rule"}
          </Button>
          {isEditMode && (
            <Button type="button" variant="ghost" onClick={onFinishEditing}>
              Cancel
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
};
