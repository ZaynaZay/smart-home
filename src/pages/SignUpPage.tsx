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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { BrainCircuit } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

// 1. Validation Schema: Defines the rules for the form fields.
const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long." }),
});

const SignUpPage = () => {
  const navigate = useNavigate();

  // 2. Form Hook: Initializes the form with validation.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  // 3. Submit Handler: This function is called when the form is submitted.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    const { name, email, password } = values;

    // Call Supabase to sign up the user
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // Store the user's name in the metadata for future use
        data: {
          full_name: name,
        },
      },
    });

    if (error) {
      toast.error(error.message); // Show error notification
    } else {
      toast.success(
        "Account created! Please check your email for a verification link."
      );
      navigate("/login"); // Redirect to login page
    }
  }

  return (
    <div className="w-full lg:grid lg:min-h-[600px] lg:grid-cols-2 xl:min-h-[800px]">
      {/* Left Column: Branding and Quote */}
      <div className="hidden bg-muted lg:block p-10">
        <div className="flex flex-col justify-between h-full">
          <Link
            to="/"
            className="flex items-center space-x-2 text-xl font-bold"
          >
            <BrainCircuit className="h-8 w-8 text-primary" />
            <span>WellnessHub</span>
          </Link>
          <div className="text-lg">
            <blockquote className="italic">
              "This application has fundamentally improved my relationship with
              technology. It's not just a tool; it's a companion."
            </blockquote>
            <p className="mt-2 font-semibold">- A Happy User</p>
          </div>
        </div>
      </div>

      {/* Right Column: Sign-Up Form */}
      <div className="flex items-center justify-center py-12">
        <Card className="w-full max-w-md mx-auto border-0 md:border">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Create an Account</CardTitle>
            <CardDescription>
              Enter your information to start your wellness journey.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="you@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">
                  Create Account
                </Button>
              </form>
            </Form>
            <div className="mt-4 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-medium text-primary hover:underline"
              >
                Log In
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SignUpPage;
