"use client";

import { useState, useCallback } from "react";
import { getAuthCoreBaseUrl } from "../auth/authCoreConfig";

export interface UploadUrlResponse {
	uploadURL: string;
	imageId: string;
	deliveryUrl: string;
}

export interface UseAvatarUploadOptions {
	userId?: string;
	onSuccess?: (result: { imageId: string; deliveryUrl: string }) => void;
	onError?: (error: Error) => void;
}

/**
 * Hook for uploading avatars to Cloudflare Images via auth-svc.
 * Uses direct upload flow:
 * 1. Get a one-time upload URL from the backend
 * 2. Upload the file directly to Cloudflare
 * 3. Return the delivery URL
 */
export function useAvatarUpload(options: UseAvatarUploadOptions = {}) {
	const [isUploading, setIsUploading] = useState(false);
	const [progress, setProgress] = useState(0);
	const [error, setError] = useState<Error | null>(null);

	const upload = useCallback(
		async (
			file: File,
		): Promise<{ imageId: string; deliveryUrl: string } | null> => {
			setIsUploading(true);
			setProgress(0);
			setError(null);

			try {
				// Step 1: Get upload URL from backend
				const baseUrl = getAuthCoreBaseUrl();
				const response = await fetch(`${baseUrl}/avatars/upload-url`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					credentials: "include",
					body: JSON.stringify({
						userId: options.userId,
					}),
				});

				if (!response.ok) {
					throw new Error("Failed to get upload URL");
				}

				interface ApiResponse {
					success: boolean;
					result?: UploadUrlResponse;
					errors?: Array<{ message: string }>;
				}

				const data = (await response.json()) as ApiResponse;
				if (!data.success || !data.result) {
					throw new Error(
						data.errors?.[0]?.message ?? "Failed to get upload URL",
					);
				}

				const uploadUrlResponse = data.result;
				setProgress(20);

				// Step 2: Upload directly to Cloudflare
				const formData = new FormData();
				formData.append("file", file);

				const uploadResponse = await fetch(uploadUrlResponse.uploadURL, {
					method: "POST",
					body: formData,
				});

				if (!uploadResponse.ok) {
					throw new Error("Failed to upload avatar to Cloudflare");
				}

				setProgress(100);

				const result = {
					imageId: uploadUrlResponse.imageId,
					deliveryUrl: uploadUrlResponse.deliveryUrl,
				};

				options.onSuccess?.(result);
				return result;
			} catch (err) {
				const error = err instanceof Error ? err : new Error("Upload failed");
				setError(error);
				options.onError?.(error);
				return null;
			} finally {
				setIsUploading(false);
			}
		},
		[options],
	);

	return {
		upload,
		isUploading,
		progress,
		error,
	};
}

/**
 * Delete an avatar from Cloudflare Images.
 */
export async function deleteAvatar(imageId: string): Promise<void> {
	const baseUrl = getAuthCoreBaseUrl();
	const response = await fetch(`${baseUrl}/avatars/${imageId}`, {
		method: "DELETE",
		credentials: "include",
	});

	if (!response.ok) {
		throw new Error("Failed to delete avatar");
	}
}
