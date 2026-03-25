import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@workspace/ui";
import { Input } from "@workspace/ui";
import { NativeSelect as Select } from "./ui/native-select";
import { useCreateAlert } from "@/hooks/use-alerts";

const formSchema = z.object({
  title: z.string().min(3),
  message: z.string().min(5),
  severity: z.enum(["low", "medium", "high", "critical"]),
  category: z.string().min(2),
  isRead: z.boolean().default(false),
});

type FormData = z.infer<typeof formSchema>;

export function AlertForm({ onSuccess }: { onSuccess: () => void }) {
  const createMutation = useCreateAlert();
  
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      severity: "medium",
      isRead: false,
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
        <label className="text-xs uppercase tracking-wider text-muted-foreground font-display">Alert Designation</label>
        <Input {...register("title")} placeholder="Anomaly Detected" className="border-primary/20" />
        {errors.title && <p className="text-destructive text-xs">{errors.title.message}</p>}
      </div>
      
      <div className="space-y-2">
        <label className="text-xs uppercase tracking-wider text-muted-foreground font-display">Telemetry Data (Message)</label>
        <textarea 
          {...register("message")} 
          className="flex min-h-[80px] w-full rounded-md border border-primary/20 bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent"
          placeholder="System deviation exceeds parameters..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-muted-foreground font-display">Severity Level</label>
          <Select {...register("severity")} className="border-primary/20">
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-muted-foreground font-display">Category</label>
          <Input {...register("category")} placeholder="Security" className="border-primary/20" />
        </div>
      </div>

      <div className="pt-4 flex justify-end gap-2">
        <Button 
          type="submit" 
          disabled={createMutation.isPending}
          className="w-full bg-secondary/10 border-secondary/50 text-secondary shadow-[0_0_15px_rgba(139,92,246,0.3)] hover:shadow-[0_0_25px_rgba(139,92,246,0.6)]"
        >
          {createMutation.isPending ? "Submitting..." : "Broadcast Alert"}
        </Button>
      </div>
    </form>
  );
}
