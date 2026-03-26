import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@szl-holdings/ui";
import { Input } from "@szl-holdings/ui";
import { NativeSelect as Select } from "./ui/native-select";
import { useCreatePrediction } from "@/hooks/use-predictions";

const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description required"),
  confidence: z.coerce.number().min(0).max(100),
  category: z.string().min(2),
  outcome: z.string().min(2),
  timeframe: z.string().min(2),
  status: z.enum(["pending", "confirmed", "refuted"]),
});

type FormData = z.infer<typeof formSchema>;

export function PredictionForm({ onSuccess }: { onSuccess: () => void }) {
  const createMutation = useCreatePrediction();
  
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: "pending",
      confidence: 50,
    }
  });

  const onSubmit = (data: FormData) => {
    createMutation.mutate(
      { data },
      {
        onSuccess: () => onSuccess(),
      }
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <label className="text-xs uppercase tracking-wider text-muted-foreground font-display">Vector Title</label>
        <Input {...register("title")} placeholder="e.g. Market Expansion Alpha" className="border-primary/20 focus-visible:border-primary/50" />
        {errors.title && <p className="text-destructive text-xs">{errors.title.message}</p>}
      </div>
      
      <div className="space-y-2">
        <label className="text-xs uppercase tracking-wider text-muted-foreground font-display">Analysis Detail</label>
        <textarea 
          {...register("description")} 
          className="flex min-h-[80px] w-full rounded-md border border-primary/20 bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent"
          placeholder="Detailed predictive analysis..."
        />
        {errors.description && <p className="text-destructive text-xs">{errors.description.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-muted-foreground font-display">Confidence (%)</label>
          <Input type="number" {...register("confidence")} className="border-primary/20" />
          {errors.confidence && <p className="text-destructive text-xs">{errors.confidence.message}</p>}
        </div>
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-muted-foreground font-display">Timeframe</label>
          <Input {...register("timeframe")} placeholder="Q3 2025" className="border-primary/20" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-muted-foreground font-display">Category</label>
          <Input {...register("category")} placeholder="Market" className="border-primary/20" />
        </div>
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-muted-foreground font-display">Status</label>
          <Select {...register("status")} className="border-primary/20">
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="refuted">Refuted</option>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs uppercase tracking-wider text-muted-foreground font-display">Predicted Outcome</label>
        <Input {...register("outcome")} placeholder="Target acquisition" className="border-primary/20" />
      </div>

      {createMutation.isError && (
        <p className="text-destructive text-xs bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">Failed to create prediction. Please try again.</p>
      )}

      <div className="pt-4 flex justify-end gap-2">
        <Button 
          type="submit" 
          disabled={createMutation.isPending}
          className="w-full"
        >
          {createMutation.isPending ? "Computing..." : "Compute Prediction"}
        </Button>
      </div>
    </form>
  );
}
