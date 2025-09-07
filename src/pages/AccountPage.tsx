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
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { Loader2, Upload } from "lucide-react";
// CORRECTED: Import AvatarImage from our shadcn component, not Radix directly
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// --- VALIDATION SCHEMAS ---
const profileFormSchema = z.object({
  fullName: z
    .string()
    .min(2, { message: "Name must be at least 2 characters." }),
  location: z.string().optional(),
  age: z.coerce.number().int().positive().optional().or(z.literal("")),
});

const passwordFormSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, { message: "Password must be at least 8 characters." }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

const AccountPage = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const profileForm = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: { fullName: "", location: "", age: "" },
  });

  const passwordForm = useForm<z.infer<typeof passwordFormSchema>>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  // --- DATA FETCHING ---
  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        const { data, error } = await supabase
          .from("profiles")
          .select("full_name, location, age, avatar_url")
          .eq("id", user.id)
          .single();
        if (error) {
          console.error("Error fetching profile for account page:", error);
        } else if (data) {
          profileForm.setValue("fullName", data.full_name || "");
          profileForm.setValue("location", data.location || "");
          profileForm.setValue("age", data.age || "");
          if (data.avatar_url) {
            // Add a timestamp to the URL to bypass browser cache when image is updated
            setAvatarUrl(`${data.avatar_url}?t=${new Date().getTime()}`);
          }
        }
      }
    };
    fetchProfile();
  }, [user, profileForm]);

  // --- SUBMIT HANDLERS ---
  async function onProfileSubmit(values: z.infer<typeof profileFormSchema>) {
    if (!user) return;
    setIsLoading(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: values.fullName,
        location: values.location || null,
        age: values.age || null,
      })
      .eq("id", user.id);

    await supabase.auth.updateUser({ data: { full_name: values.fullName } });

    setIsLoading(false);
    if (error) toast.error("Failed to update profile. Please try again.");
    else toast.success("Your profile has been updated successfully!");
  }

  async function onPasswordSubmit(values: z.infer<typeof passwordFormSchema>) {
    setIsLoading(true);
    const { error } = await supabase.auth.updateUser({
      password: values.newPassword,
    });
    setIsLoading(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Your password has been updated successfully!");
      passwordForm.reset();
    }
  }

  // --- AVATAR UPLOAD HANDLER ---
  const handleAvatarUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!event.target.files || event.target.files.length === 0 || !user) return;

    const file = event.target.files[0];
    const fileExt = file.name.split(".").pop();
    const filePath = `${user.id}/${Date.now()}.${fileExt}`;

    setIsUploading(true);
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file);

    if (uploadError) {
      toast.error("Error uploading image. Please try again.");
      console.error(uploadError);
    } else {
      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
      if (data?.publicUrl) {
        const newUrl = data.publicUrl;
        const { error: updateError } = await supabase
          .from("profiles")
          .update({ avatar_url: newUrl })
          .eq("id", user.id);
        if (updateError) {
          toast.error("Failed to save avatar URL.");
        } else {
          // Add timestamp to force re-render with new image
          setAvatarUrl(`${newUrl}?t=${new Date().getTime()}`);
          toast.success("Avatar updated!");
        }
      }
    }
    setIsUploading(false);
  };

  const getInitials = (name?: string | null) => {
    if (!name) return user?.email?.[0].toUpperCase() ?? "?";
    const names = name.split(" ").filter((n) => n);
    return (
      names.length > 1
        ? names[0][0] + names[names.length - 1][0]
        : name.substring(0, 2)
    ).toUpperCase();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Account</h1>
        <p className="text-muted-foreground">
          Manage your account details and password.
        </p>
      </div>
      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Update your personal details here.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src={avatarUrl ?? undefined} alt="User Avatar" />
              <AvatarFallback>
                {getInitials(profileForm.getValues("fullName"))}
              </AvatarFallback>
            </Avatar>
            <Button asChild variant="outline">
              <label htmlFor="avatar-upload" className="cursor-pointer">
                {isUploading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="mr-2 h-4 w-4" />
                )}
                {isUploading ? "Uploading..." : "Upload Picture"}
              </label>
            </Button>
            <Input
              id="avatar-upload"
              type="file"
              accept="image/png, image/jpeg"
              onChange={handleAvatarUpload}
              className="hidden"
            />
          </div>

          <Form {...profileForm}>
            <form
              onSubmit={profileForm.handleSubmit(onProfileSubmit)}
              className="space-y-4 max-w-lg"
            >
              <FormField
                control={profileForm.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={profileForm.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="City, Country"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={profileForm.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Age</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Your Age"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Profile
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>
            Choose a new password. It must be at least 8 characters long.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...passwordForm}>
            <form
              onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
              className="space-y-4 max-w-lg"
            >
              <FormField
                control={passwordForm.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
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
              <FormField
                control={passwordForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
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
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Change Password
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountPage;
