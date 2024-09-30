import { Camera02Icon, Cancel01Icon, Loading03AnimatedIcon } from "@/components/icons/hugeicons";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import { optimizeImage } from "@/lib/optimize-image";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema } from "@server/common/schemas/user";
import { safeTry } from "@server/lib/safe-try";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

type ProfilePicture = {
  name: string;
  base64: string;
};

export function CompleteProfileForm() {
  const [profilePicture, setProfilePicture] = useState<ProfilePicture | undefined>();
  const [textLength, setTextLength] = useState(0);
  const ref = useRef<HTMLInputElement>(null);

  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const form = useForm<z.infer<typeof insertUserSchema>>({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      name: "",
      bio: "",
      link: "",
    },
  });

  async function handleUploadFile(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) {
      return;
    }

    const { base64, name } = await optimizeImage(
      e.target.files[0],
      {
        x: 1080,
        y: 1080,
      },
      0.8,
    );

    setProfilePicture({ base64, name });
  }

  async function onSubmit(data: z.infer<typeof insertUserSchema>) {
    const { error } = await safeTry(api.account.user.$put({ json: { ...data, profilePicture } }));

    if (error !== null) {
      form.setError("root", { message: "Something went wrong." });
      return;
    }

    queryClient.invalidateQueries({ queryKey: ["user", "account"] });
    navigate({ to: "/", replace: true });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pb-16">
      <div className="space-y-1">
        <Label className="text-base text-foreground">Profile Picture</Label>
        <div className="relative mx-auto w-fit">
          <figure className="h-[84px] w-[84px] rounded-full">
            {!profilePicture ? (
              <img
                src="/images/empty-profile-picture/128x128.jpg"
                width={84}
                height={84}
                alt="Profile picture"
                className="rounded-full border border-muted-foreground/30"
              />
            ) : (
              <img
                src={profilePicture.base64}
                width={84}
                height={84}
                alt="Profile picture"
                className="rounded-full border border-muted-foreground/30"
              />
            )}
          </figure>
          <label
            htmlFor="profile-picture"
            className="group absolute top-0 flex h-[84px] w-[84px] items-center justify-center rounded-full transition-colors hover:bg-neutral-800/45"
          >
            <Camera02Icon
              width={32}
              height={32}
              strokeWidth={2}
              className="-translate-y-px text-white opacity-0 transition-opacity group-hover:opacity-100"
            />
          </label>
          <input
            ref={ref}
            id="profile-picture"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            hidden
            className="hidden"
            onChange={handleUploadFile}
          />
          <Button
            variant="outline"
            type="button"
            size="icon"
            disabled={profilePicture == undefined}
            className="absolute -right-8 -top-4 rounded-full transition-all active:scale-95"
            onClick={() => {
              if (ref.current) {
                ref.current.value = "";
              }
              setProfilePicture(undefined);
            }}
          >
            <Cancel01Icon width={16} height={16} strokeWidth={2.5} />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">You can choose a picture for your profile.</p>
      </div>
      <div className="space-y-1">
        <Label className="text-base text-foreground">Name</Label>
        <Input {...form.register("name")} placeholder="Name" spellCheck={false} autoFocus />
        <p className="text-sm text-muted-foreground">This is your public display name.</p>
        {form.formState.errors.name && (
          <p className="text-sm text-destructive dark:text-red-400">{form.formState.errors.name.message}</p>
        )}
      </div>
      <div className="space-y-1">
        <Label className="text-base text-foreground">Biography</Label>
        <Textarea
          {...form.register("bio")}
          name="bio"
          rows={3}
          className="resize-none rounded-xl border-none bg-muted px-5 py-3 text-base leading-snug outline-offset-0 focus-visible:ring-1 focus-visible:ring-muted-foreground/60 focus-visible:ring-offset-0 dark:bg-muted/75"
          maxLength={150}
          onChange={(e) => {
            setTextLength(e.currentTarget.value.length);
          }}
        />
        <span className="flex justify-between">
          <span className="text-sm text-muted-foreground">Write something about you.</span>
          <span className="text-[.75rem] text-muted-foreground">{textLength} / 150</span>
        </span>
        {form.formState.errors.bio && <p className="text-sm dark:text-red-400">{form.formState.errors.bio.message}</p>}
      </div>
      <div className="space-y-1">
        <Label className="text-base text-foreground">Link</Label>
        <Input {...form.register("link")} name="link" type="url" />
        <p className="text-sm text-muted-foreground">Short link of other site.</p>
        {form.formState.errors.link && (
          <p className="text-sm text-destructive dark:text-red-400">{form.formState.errors.link.message}</p>
        )}
      </div>
      {form.formState.errors.root && (
        <FormMessage className="text-sm text-destructive dark:text-red-400">
          {form.formState.errors.root.message}
        </FormMessage>
      )}
      <Button
        type="submit"
        aria-disabled={form.watch("name") === "" || form.formState.isSubmitting}
        className="!mt-8 w-full rounded-xl py-7 text-base aria-disabled:cursor-not-allowed aria-disabled:text-muted-foreground aria-disabled:hover:bg-primary"
        onClick={(e) => {
          if (e.currentTarget.ariaDisabled === "true") {
            e.preventDefault();
            return;
          }
        }}
      >
        {form.formState.isSubmitting ? (
          <Loading03AnimatedIcon strokeWidth={3} width={24} height={24} className="text-secondary" />
        ) : (
          "Save"
        )}
      </Button>
    </form>
  );
}
