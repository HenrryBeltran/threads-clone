"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { optimizeImage } from "@/lib/optimizeImage";
import { Try } from "@/lib/safeTry";
import { zodResolver } from "@hookform/resolvers/zod";
import profilePic from "@public/profile-picture.jpg";
import { Camera, X } from "lucide-react";
import NextImage from "next/image";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { registerUser } from "./actions";

const registerFormSchema = z.object({
  username: z
    .string({ required_error: "Username is required." })
    .min(3, {
      message: "Username must be at least 3 characters.",
    })
    .max(30, { message: "Username cannot exceed 30 characters." })
    .refine((s) => !s.includes(" "), "Username cannot have spaces.")
    .refine(
      (s) => !s.startsWith(".") && !s.endsWith("."),
      "Contains misplaced special characters.",
    )
    .refine(
      (s) => /^[a-zA-Z_\d]([a-zA-Z\d_]*\.?[a-zA-Z\d_]+)*$/.test(s),
      `Invalid special characters.\n\nUnderscores and dots are valid.`,
    ),
  bio: z
    .string()
    .max(150, { message: "Biography must be less then 150 characters." })
    .optional(),
});

export type RegisterFormData = {
  username: string;
  bio: string;
};

type ProfilePicture = {
  name: string;
  base64: string;
};

export default function RegisterForm() {
  const [profilePicture, setProfilePicture] = useState<ProfilePicture | undefined>();
  const [textLength, setTextLength] = useState(0);

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      username: "",
      bio: "",
    },
  });

  const ref = useRef<HTMLImageElement>(null);

  async function handleUploadFile(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) {
      return;
    }

    const { base64, name } = await optimizeImage(
      e.target.files.item(0)!,
      {
        x: 340,
        y: 340,
      },
      0.8,
    );

    if (ref.current) {
      ref.current.src = base64;
      ref.current.srcset = "";
    }

    setProfilePicture({ base64, name });
  }

  async function onSubmit(data: RegisterFormData) {
    const { username, bio } = data;
    const { error, result } = await Try(
      registerUser({ username, bio, profilePicture: profilePicture }),
    );

    if (error) {
      return new Error(JSON.stringify(error));
    }

    if (result) {
      const key = Object.keys(result.errors)[0] as "username";
      form.setError(key, { message: result.errors[key] });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <Label>Profile Picture</Label>
          <div className="relative mx-auto w-fit">
            <figure className="h-[84px] w-[84px] rounded-full border border-muted">
              <NextImage
                ref={ref}
                src={profilePic}
                width={84}
                height={84}
                quality={100}
                priority
                alt="Profile picture"
                className="rounded-full"
              />
            </figure>
            <label
              htmlFor="profile-picture"
              className="group absolute top-0 flex h-[84px] w-[84px] items-center justify-center rounded-full transition-colors hover:bg-neutral-800/35"
            >
              <Camera
                size={32}
                absoluteStrokeWidth
                strokeWidth={3}
                className="-translate-y-px opacity-0 invert transition-opacity group-hover:opacity-100"
              />
            </label>
            <Input
              id="profile-picture"
              type="file"
              accept="image/*"
              hidden
              className="hidden"
              onChange={handleUploadFile}
            />
            <Button
              variant="outline"
              size="icon"
              disabled={profilePicture == undefined}
              className="absolute -right-8 -top-4 rounded-full"
              onClick={() => {
                if (ref.current) {
                  ref.current.src = profilePic.src;
                  setProfilePicture(undefined);
                }
              }}
            >
              <X size={16} absoluteStrokeWidth strokeWidth={1.5} />
            </Button>
          </div>
          <p className="text-[0.8rem] text-muted-foreground">
            You can choose a picture for your profile.
          </p>
        </div>
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>This is your public display name.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem className="relative">
              <FormLabel>Biography</FormLabel>
              <FormControl
                onChange={() => {
                  setTextLength(form.getValues("bio").length);
                }}
              >
                <Textarea
                  rows={3}
                  className="resize-none pb-6"
                  maxLength={150}
                  {...field}
                />
              </FormControl>
              <span className="absolute bottom-8 right-3 text-[.75rem] text-muted-foreground">
                {textLength} / 150
              </span>
              <FormDescription>Write something about you.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        {form.formState.errors.root && (
          <FormMessage>{form.formState.errors.root.message}</FormMessage>
        )}
        <Button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="w-full rounded-full"
        >
          Register
        </Button>
      </form>
    </Form>
  );
}
