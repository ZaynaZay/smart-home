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
import { useState } from "react";

// Zod schema for form validation
const formSchema = z.object({
  emotion: z.string().min(1, { message: "Please select an emotion." }),
  action: z.string().min(1, { message: "Please select an action." }),
  payload: z
    .string()
    .min(1, { message: "Please provide a value for the action." }),
});

// Constants for the select dropdowns
const emotions = ["Happy", "Sad", "Angry", "Surprise", "Fear", "Neutral"];
const actions = [
  { value: "play_music", label: "Play Music (Directory Path)" },
  { value: "change_wallpaper", label: "Change Wallpaper (Image Path)" },
  { value: "speak", label: "Text-to-Speech (Message)" },
];

// Define the component's props
interface AddRuleFormProps {
  onRuleAdded: () => void;
}

// CORRECTED: The component name is now correct
export const AddRuleForm = ({ onRuleAdded }: AddRuleFormProps) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize the form with react-hook-form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { emotion: "", action: "", payload: "" },
  });

  // Define the submit handler
  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) return;
    setIsSubmitting(true);
    const { error } = await supabase
      .from("user_rules")
      .insert([{ ...values, user_id: user.id }]);
    setIsSubmitting(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("New rule created successfully!");
      form.reset(); // Clear the form for the next entry
      onRuleAdded(); // Tell the parent page to refresh its list of rules
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="emotion"
            render={({ field }) => (
              <FormItem>
                <FormLabel>When Emotion Is</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
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
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
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
        <Button type="submit" disabled={isSubmitting} id="tour-step-4">
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Add Rule
        </Button>
      </form>
    </Form>
  );
};
