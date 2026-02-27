"use client";

import { useForm, Controller } from "react-hook-form";
import { useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import type { WidgetConfig } from "./CarouselWidget";

export interface WidgetFormValues {
  name: string;
  layout: string;
  theme: string;
  bgColor: string;
  textColor: string;
  starColor: string;
  borderRadius: number;
  showRating: boolean;
  showAvatar: boolean;
  showCompany: boolean;
  showDate: boolean;
  autoplay: boolean;
  autoplaySpeed: number;
  maxDisplay: number;
}

interface WidgetCustomizerProps {
  defaultValues: WidgetFormValues;
  onChange: (values: WidgetFormValues) => void;
  onSubmit?: (values: WidgetFormValues) => void;
}

const LAYOUT_OPTIONS = [
  { value: "CAROUSEL", label: "Carousel" },
  { value: "GRID", label: "Grid" },
  { value: "LIST", label: "List" },
  { value: "MASONRY", label: "Masonry" },
  { value: "WALL_OF_LOVE", label: "Wall of Love" },
  { value: "MINIMAL", label: "Minimal" },
];

const THEME_OPTIONS = [
  { value: "LIGHT", label: "Light" },
  { value: "DARK", label: "Dark" },
  { value: "CUSTOM", label: "Custom" },
];

export function WidgetCustomizer({
  defaultValues,
  onChange,
  onSubmit,
}: WidgetCustomizerProps) {
  const { control, watch, handleSubmit, setValue } =
    useForm<WidgetFormValues>({
      defaultValues,
    });

  const watchedValues = watch();
  const theme = watch("theme");

  useEffect(() => {
    onChange(watchedValues);
  }, [
    watchedValues.name,
    watchedValues.layout,
    watchedValues.theme,
    watchedValues.bgColor,
    watchedValues.textColor,
    watchedValues.starColor,
    watchedValues.borderRadius,
    watchedValues.showRating,
    watchedValues.showAvatar,
    watchedValues.showCompany,
    watchedValues.showDate,
    watchedValues.autoplay,
    watchedValues.autoplaySpeed,
    watchedValues.maxDisplay,
    onChange,
  ]);

  return (
    <form
      id="widget-form"
      onSubmit={onSubmit ? handleSubmit(onSubmit) : undefined}
      className="space-y-6"
    >
      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="name">Widget Name</Label>
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <Input
              id="name"
              placeholder="My Widget"
              {...field}
            />
          )}
        />
      </div>

      <Separator />

      {/* Layout */}
      <div className="space-y-2">
        <Label>Layout</Label>
        <Controller
          name="layout"
          control={control}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select layout" />
              </SelectTrigger>
              <SelectContent>
                {LAYOUT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      {/* Theme */}
      <div className="space-y-2">
        <Label>Theme</Label>
        <Controller
          name="theme"
          control={control}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                {THEME_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      {/* Custom Colors */}
      {theme === "CUSTOM" && (
        <>
          <Separator />
          <div className="space-y-4">
            <Label className="text-xs font-medium uppercase tracking-wider opacity-60">
              Custom Colors
            </Label>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bgColor" className="text-xs">
                  Background
                </Label>
                <Controller
                  name="bgColor"
                  control={control}
                  render={({ field }) => (
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        id="bgColor"
                        value={field.value}
                        onChange={field.onChange}
                        className="h-8 w-10 cursor-pointer rounded border"
                      />
                      <Input
                        value={field.value}
                        onChange={field.onChange}
                        className="h-8 text-xs"
                      />
                    </div>
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="textColor" className="text-xs">
                  Text
                </Label>
                <Controller
                  name="textColor"
                  control={control}
                  render={({ field }) => (
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        id="textColor"
                        value={field.value}
                        onChange={field.onChange}
                        className="h-8 w-10 cursor-pointer rounded border"
                      />
                      <Input
                        value={field.value}
                        onChange={field.onChange}
                        className="h-8 text-xs"
                      />
                    </div>
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="starColor" className="text-xs">
                  Star
                </Label>
                <Controller
                  name="starColor"
                  control={control}
                  render={({ field }) => (
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        id="starColor"
                        value={field.value}
                        onChange={field.onChange}
                        className="h-8 w-10 cursor-pointer rounded border"
                      />
                      <Input
                        value={field.value}
                        onChange={field.onChange}
                        className="h-8 text-xs"
                      />
                    </div>
                  )}
                />
              </div>
            </div>
          </div>
        </>
      )}

      <Separator />

      {/* Border Radius */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Border Radius</Label>
          <span className="text-muted-foreground text-xs">
            {watchedValues.borderRadius}px
          </span>
        </div>
        <Controller
          name="borderRadius"
          control={control}
          render={({ field }) => (
            <Slider
              min={0}
              max={50}
              step={1}
              value={[field.value]}
              onValueChange={(value) => field.onChange(value[0])}
            />
          )}
        />
      </div>

      <Separator />

      {/* Content Toggles */}
      <div className="space-y-4">
        <Label className="text-xs font-medium uppercase tracking-wider opacity-60">
          Content
        </Label>

        <div className="flex items-center justify-between">
          <Label htmlFor="showRating" className="cursor-pointer">
            Show Rating
          </Label>
          <Controller
            name="showRating"
            control={control}
            render={({ field }) => (
              <Switch
                id="showRating"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="showAvatar" className="cursor-pointer">
            Show Avatar
          </Label>
          <Controller
            name="showAvatar"
            control={control}
            render={({ field }) => (
              <Switch
                id="showAvatar"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="showCompany" className="cursor-pointer">
            Show Company
          </Label>
          <Controller
            name="showCompany"
            control={control}
            render={({ field }) => (
              <Switch
                id="showCompany"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="showDate" className="cursor-pointer">
            Show Date
          </Label>
          <Controller
            name="showDate"
            control={control}
            render={({ field }) => (
              <Switch
                id="showDate"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
        </div>
      </div>

      <Separator />

      {/* Autoplay */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="autoplay" className="cursor-pointer">
            Autoplay
          </Label>
          <Controller
            name="autoplay"
            control={control}
            render={({ field }) => (
              <Switch
                id="autoplay"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
        </div>

        {watchedValues.autoplay && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Autoplay Speed</Label>
              <span className="text-muted-foreground text-xs">
                {watchedValues.autoplaySpeed}s
              </span>
            </div>
            <Controller
              name="autoplaySpeed"
              control={control}
              render={({ field }) => (
                <Slider
                  min={1}
                  max={30}
                  step={1}
                  value={[field.value]}
                  onValueChange={(value) => field.onChange(value[0])}
                />
              )}
            />
          </div>
        )}
      </div>

      <Separator />

      {/* Max Display */}
      <div className="space-y-2">
        <Label htmlFor="maxDisplay">Max Testimonials to Display</Label>
        <Controller
          name="maxDisplay"
          control={control}
          render={({ field }) => (
            <Input
              id="maxDisplay"
              type="number"
              min={1}
              max={50}
              value={field.value}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val)) {
                  field.onChange(Math.min(50, Math.max(1, val)));
                }
              }}
            />
          )}
        />
      </div>
    </form>
  );
}
