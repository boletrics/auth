"use client";

import { useState, useCallback, useRef, type ChangeEvent } from "react";
import { Camera, Loader2, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAvatarUpload } from "@/lib/api/use-avatars";

export interface AvatarUploadProps {
	/** Current avatar URL (for showing preview) */
	value?: string;
	/** Called when avatar is uploaded */
	onChange?: (url: string | undefined) => void;
	/** User ID to associate with the avatar */
	userId?: string;
	/** Size of the avatar in pixels */
	size?: number;
	/** Additional class name */
	className?: string;
	/** Accepted file types */
	accept?: string;
	/** Max file size in bytes (default 5MB) */
	maxSize?: number;
	/** Disabled state */
	disabled?: boolean;
	/** User name for alt text */
	userName?: string;
}

export function AvatarUpload({
	value,
	onChange,
	userId,
	size = 96,
	className,
	accept = "image/jpeg,image/png,image/gif,image/webp",
	maxSize = 5 * 1024 * 1024, // 5MB
	disabled = false,
	userName,
}: AvatarUploadProps) {
	const [previewUrl, setPreviewUrl] = useState<string | undefined>(value);
	const [uploadError, setUploadError] = useState<string | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const { upload, isUploading } = useAvatarUpload({
		userId,
		onSuccess: (result) => {
			setPreviewUrl(result.deliveryUrl);
			onChange?.(result.deliveryUrl);
			setUploadError(null);
		},
		onError: (error) => {
			setUploadError(error.message);
		},
	});

	const handleFile = useCallback(
		async (file: File) => {
			// Validate file type
			const validTypes = accept.split(",").map((t) => t.trim());
			if (!validTypes.includes(file.type)) {
				setUploadError(`Tipo de archivo inválido`);
				return;
			}

			// Validate file size
			if (file.size > maxSize) {
				setUploadError(
					`Archivo muy grande. Máx: ${Math.round(maxSize / 1024 / 1024)}MB`,
				);
				return;
			}

			setUploadError(null);

			// Create local preview immediately
			const localPreview = URL.createObjectURL(file);
			setPreviewUrl(localPreview);

			// Upload to Cloudflare
			const result = await upload(file);

			// Clean up local preview if upload succeeded
			if (result) {
				URL.revokeObjectURL(localPreview);
			}
		},
		[accept, maxSize, upload],
	);

	const handleInputChange = useCallback(
		(e: ChangeEvent<HTMLInputElement>) => {
			const file = e.target.files?.[0];
			if (file) {
				handleFile(file);
			}
			// Reset input so same file can be selected again
			e.target.value = "";
		},
		[handleFile],
	);

	const handleClick = useCallback(() => {
		if (disabled || isUploading) return;
		fileInputRef.current?.click();
	}, [disabled, isUploading]);

	return (
		<div className={cn("relative inline-block", className)}>
			<input
				ref={fileInputRef}
				type="file"
				accept={accept}
				onChange={handleInputChange}
				className="hidden"
				disabled={disabled || isUploading}
			/>

			<button
				type="button"
				onClick={handleClick}
				disabled={disabled || isUploading}
				className={cn(
					"relative flex items-center justify-center rounded-full overflow-hidden border-2 border-muted transition-all group",
					"hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
					(disabled || isUploading) && "cursor-not-allowed opacity-50",
				)}
				style={{ width: size, height: size }}
				aria-label="Cambiar foto de perfil"
			>
				{previewUrl ? (
					// eslint-disable-next-line @next/next/no-img-element
					<img
						src={previewUrl}
						alt={userName ? `Avatar de ${userName}` : "Avatar"}
						className="h-full w-full object-cover"
					/>
				) : (
					<div className="flex h-full w-full items-center justify-center bg-muted">
						<User className="h-1/2 w-1/2 text-muted-foreground" />
					</div>
				)}

				{/* Overlay with camera icon */}
				{!isUploading && !disabled && (
					<div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
						<Camera className="h-6 w-6 text-white" />
					</div>
				)}

				{/* Loading state */}
				{isUploading && (
					<div className="absolute inset-0 flex items-center justify-center bg-black/50">
						<Loader2 className="h-6 w-6 animate-spin text-white" />
					</div>
				)}
			</button>

			{uploadError && (
				<p className="mt-2 text-center text-xs text-destructive">
					{uploadError}
				</p>
			)}
		</div>
	);
}
