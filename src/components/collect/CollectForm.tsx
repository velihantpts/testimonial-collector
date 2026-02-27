"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  User,
  Mail,
  Building2,
  Briefcase,
  Globe,
  Send,
  Loader2,
} from "lucide-react";
import { submitTestimonialSchema, type SubmitTestimonialInput } from "@/lib/validations";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StarRatingInput } from "@/components/collect/StarRatingInput";
import { AvatarUpload } from "@/components/collect/AvatarUpload";
import { PromptQuestions } from "@/components/collect/PromptQuestions";
import { ThankYouScreen } from "@/components/collect/ThankYouScreen";

interface CollectPageConfig {
  id: string;
  title: string;
  description: string;
  thankYouMessage: string;
  brandColor: string;
  collectVideo: boolean;
  collectAvatar: boolean;
  collectCompany: boolean;
  collectWebsite: boolean;
  promptQuestions: string[];
}

interface CollectFormProps {
  slug: string;
  config: CollectPageConfig;
  projectName: string;
  company: {
    name: string | null;
    logo: string | null;
  };
  plan: {
    type: string;
    videoTestimonials: boolean;
    customBranding: boolean;
    removeBranding: boolean;
  };
}

export function CollectForm({
  slug,
  config,
  projectName,
  company,
  plan,
}: CollectFormProps) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SubmitTestimonialInput>({
    resolver: zodResolver(submitTestimonialSchema),
    defaultValues: {
      name: "",
      email: "",
      company: "",
      jobTitle: "",
      website: "",
      text: "",
      rating: 0,
      avatar: "",
      videoUrl: "",
    },
  });

  const textValue = watch("text") || "";
  const ratingValue = watch("rating");

  const onSubmit = async (data: SubmitTestimonialInput) => {
    setSubmitError(null);

    try {
      const response = await fetch(`/api/collect/${slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to submit testimonial");
      }

      setIsSubmitted(true);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Something went wrong"
      );
    }
  };

  const handleSubmitAnother = () => {
    setIsSubmitted(false);
    setSubmitError(null);
    reset();
  };

  if (isSubmitted) {
    return (
      <ThankYouScreen
        message={config.thankYouMessage}
        brandColor={config.brandColor}
        onSubmitAnother={handleSubmitAnother}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Name (required) */}
      <div className="space-y-2">
        <Label htmlFor="name" className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          Your Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          placeholder="John Doe"
          {...register("name")}
          aria-invalid={!!errors.name}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      {/* Email (optional) */}
      <div className="space-y-2">
        <Label htmlFor="email" className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-muted-foreground" />
          Email
          <span className="text-xs text-muted-foreground font-normal">(optional)</span>
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="john@example.com"
          {...register("email")}
          aria-invalid={!!errors.email}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      {/* Avatar Upload (optional, if enabled) */}
      {config.collectAvatar && (
        <div className="space-y-2">
          <Label className="flex items-center gap-2">Photo</Label>
          <AvatarUpload
            value={watch("avatar") || undefined}
            onChange={(url) => setValue("avatar", url || "")}
            brandColor={config.brandColor}
          />
        </div>
      )}

      {/* Company (optional, if collectCompany enabled) */}
      {config.collectCompany && (
        <div className="space-y-2">
          <Label htmlFor="company" className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            Company
            <span className="text-xs text-muted-foreground font-normal">(optional)</span>
          </Label>
          <Input
            id="company"
            placeholder="Acme Inc."
            {...register("company")}
          />
        </div>
      )}

      {/* Job Title (optional) */}
      <div className="space-y-2">
        <Label htmlFor="jobTitle" className="flex items-center gap-2">
          <Briefcase className="h-4 w-4 text-muted-foreground" />
          Job Title
          <span className="text-xs text-muted-foreground font-normal">(optional)</span>
        </Label>
        <Input
          id="jobTitle"
          placeholder="Product Manager"
          {...register("jobTitle")}
        />
      </div>

      {/* Website (optional, if collectWebsite enabled) */}
      {config.collectWebsite && (
        <div className="space-y-2">
          <Label htmlFor="website" className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-muted-foreground" />
            Website
            <span className="text-xs text-muted-foreground font-normal">(optional)</span>
          </Label>
          <Input
            id="website"
            type="url"
            placeholder="https://example.com"
            {...register("website")}
            aria-invalid={!!errors.website}
          />
          {errors.website && (
            <p className="text-sm text-destructive">
              {errors.website.message}
            </p>
          )}
        </div>
      )}

      {/* Star Rating (required) */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          Rating <span className="text-destructive">*</span>
        </Label>
        <StarRatingInput
          value={ratingValue || 0}
          onChange={(rating) => setValue("rating", rating, { shouldValidate: true })}
          error={errors.rating?.message}
          brandColor={config.brandColor}
        />
      </div>

      {/* Prompt Questions */}
      {config.promptQuestions && config.promptQuestions.length > 0 && (
        <PromptQuestions
          questions={config.promptQuestions}
          brandColor={config.brandColor}
        />
      )}

      {/* Testimonial Text (required) */}
      <div className="space-y-2">
        <Label htmlFor="text" className="flex items-center gap-2">
          Your Testimonial <span className="text-destructive">*</span>
        </Label>
        <div className="relative">
          <Textarea
            id="text"
            placeholder="Share your experience... What problem did we help you solve? What results did you achieve?"
            rows={5}
            className="resize-y min-h-[120px]"
            {...register("text")}
            aria-invalid={!!errors.text}
          />
          <div className="mt-1 flex items-center justify-between">
            {errors.text ? (
              <p className="text-sm text-destructive">{errors.text.message}</p>
            ) : (
              <span />
            )}
            <span
              className={`text-xs ${
                textValue.length > 1000
                  ? "text-destructive"
                  : textValue.length >= 900
                    ? "text-amber-500"
                    : "text-muted-foreground"
              }`}
            >
              {textValue.length}/1000
            </span>
          </div>
        </div>
      </div>

      {/* Video Upload placeholder (if enabled and plan allows) */}
      {config.collectVideo && plan.videoTestimonials && (
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            Video Testimonial
            <span className="text-xs text-muted-foreground font-normal">(optional)</span>
          </Label>
          <div className="rounded-lg border-2 border-dashed border-muted-foreground/25 p-6 text-center">
            <p className="text-sm text-muted-foreground">
              Video upload coming soon
            </p>
          </div>
        </div>
      )}

      {/* Submit Error */}
      {submitError && (
        <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {submitError}
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full gap-2"
        size="lg"
        style={{
          backgroundColor: config.brandColor,
        }}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            <Send className="h-4 w-4" />
            Submit Testimonial
          </>
        )}
      </Button>
    </form>
  );
}
