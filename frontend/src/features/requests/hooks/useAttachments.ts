import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { attachmentsApi } from "../api/attachments.api";
import { requestKeys } from "./requestKeys";

export const useUploadAttachment = (requestId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) =>
      await attachmentsApi.upload(requestId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: requestKeys.detail(requestId),
      });
      toast.success("Attachment uploaded successfully.");
    },
    onError: () => {
      toast.error("Failed to upload attachment. Please try again.");
    },
  });
};

export const useUploadAttachments = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      requestId,
      files,
    }: {
      requestId: string;
      files: File[];
    }) => {
      for (const file of files) {
        await attachmentsApi.upload(requestId, file);
      }
    },
    onSuccess: (_data, { requestId }) => {
      queryClient.invalidateQueries({
        queryKey: requestKeys.detail(requestId),
      });
    },
  });
};

export const useUploadDischargePhoto = (requestId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) =>
      attachmentsApi.uploadDischargePhoto(requestId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: requestKeys.detail(requestId),
      });
      toast.success("Discharge photo uploaded successfully.");
    },
    onError: () => {
      toast.error("Failed to upload discharge photo. Please try again.");
    },
  });
};

export const useDeleteAttachment = (requestId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (attachmentId: string) =>
      attachmentsApi.remove(requestId, attachmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: requestKeys.detail(requestId),
      });
      toast.success("Attachment removed.");
    },
    onError: () => {
      toast.error("Failed to remove attachment. Please try again.");
    },
  });
};