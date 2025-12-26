import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock the authClient before importing functions that use it
vi.mock("./authClient", () => ({
	authClient: {
		emailOtp: {
			sendVerificationOtp: vi.fn(),
			verifyEmail: vi.fn(),
		},
		getSession: vi.fn(),
	},
}));

// Mock the session store
vi.mock("./sessionStore", () => ({
	setSession: vi.fn(),
	clearSession: vi.fn(),
}));

import { authClient } from "./authClient";
import { setSession } from "./sessionStore";
import { sendVerificationOtp, verifyEmailWithOtp } from "./authActions";

describe("authActions - OTP functions", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.resetAllMocks();
	});

	describe("sendVerificationOtp", () => {
		it("sends OTP successfully with default type", async () => {
			vi.mocked(authClient.emailOtp.sendVerificationOtp).mockResolvedValue({
				data: {},
				error: null,
			});

			const result = await sendVerificationOtp("test@example.com");

			expect(result.success).toBe(true);
			expect(result.data?.message).toBe("OTP sent successfully");
			expect(result.error).toBeNull();
			expect(authClient.emailOtp.sendVerificationOtp).toHaveBeenCalledWith({
				email: "test@example.com",
				type: "email-verification",
			});
		});

		it("sends OTP successfully with custom type", async () => {
			vi.mocked(authClient.emailOtp.sendVerificationOtp).mockResolvedValue({
				data: {},
				error: null,
			});

			const result = await sendVerificationOtp("test@example.com", "sign-in");

			expect(result.success).toBe(true);
			expect(authClient.emailOtp.sendVerificationOtp).toHaveBeenCalledWith({
				email: "test@example.com",
				type: "sign-in",
			});
		});

		it("returns error when API call fails", async () => {
			vi.mocked(authClient.emailOtp.sendVerificationOtp).mockResolvedValue({
				data: null,
				error: { message: "Rate limit exceeded", status: 429 },
			});

			const result = await sendVerificationOtp("test@example.com");

			expect(result.success).toBe(false);
			expect(result.data).toBeNull();
			expect(result.error?.message).toBe("Rate limit exceeded");
		});

		it("handles network errors gracefully", async () => {
			vi.mocked(authClient.emailOtp.sendVerificationOtp).mockRejectedValue(
				new Error("Network error"),
			);

			const result = await sendVerificationOtp("test@example.com");

			expect(result.success).toBe(false);
			expect(result.data).toBeNull();
			expect(result.error?.message).toBe("Network error");
		});

		it("handles non-Error thrown values", async () => {
			vi.mocked(authClient.emailOtp.sendVerificationOtp).mockRejectedValue(
				"String error",
			);

			const result = await sendVerificationOtp("test@example.com");

			expect(result.success).toBe(false);
			expect(result.error?.message).toBe("Failed to send OTP");
		});
	});

	describe("verifyEmailWithOtp", () => {
		it("verifies email successfully and updates session", async () => {
			vi.mocked(authClient.emailOtp.verifyEmail).mockResolvedValue({
				data: { user: { emailVerified: true } },
				error: null,
			});
			vi.mocked(authClient.getSession).mockResolvedValue({
				data: {
					user: {
						id: "user-123",
						name: "Test User",
						email: "test@example.com",
						emailVerified: true,
						createdAt: new Date(),
						updatedAt: new Date(),
					},
					session: {
						id: "session-123",
						userId: "user-123",
						token: "token-123",
						expiresAt: new Date(Date.now() + 3600000),
						createdAt: new Date(),
						updatedAt: new Date(),
					},
				},
				error: null,
			});

			const result = await verifyEmailWithOtp("test@example.com", "123456");

			expect(result.success).toBe(true);
			expect(result.data?.message).toBe("Email verified successfully");
			expect(result.error).toBeNull();
			expect(authClient.emailOtp.verifyEmail).toHaveBeenCalledWith({
				email: "test@example.com",
				otp: "123456",
			});
			expect(authClient.getSession).toHaveBeenCalled();
			expect(setSession).toHaveBeenCalled();
		});

		it("returns error for invalid OTP", async () => {
			vi.mocked(authClient.emailOtp.verifyEmail).mockResolvedValue({
				data: null,
				error: { message: "Invalid OTP", status: 400 },
			});

			const result = await verifyEmailWithOtp("test@example.com", "000000");

			expect(result.success).toBe(false);
			expect(result.data).toBeNull();
			expect(result.error?.message).toBe("Invalid OTP");
		});

		it("succeeds even if session refresh fails", async () => {
			vi.mocked(authClient.emailOtp.verifyEmail).mockResolvedValue({
				data: { user: { emailVerified: true } },
				error: null,
			});
			vi.mocked(authClient.getSession).mockResolvedValue({
				data: null,
				error: { message: "Session not found" },
			});

			const result = await verifyEmailWithOtp("test@example.com", "123456");

			// Verification still succeeds even if session refresh fails
			expect(result.success).toBe(true);
			expect(result.data?.message).toBe("Email verified successfully");
			// Session should not be updated when getSession fails
			expect(setSession).not.toHaveBeenCalled();
		});

		it("handles network errors gracefully", async () => {
			vi.mocked(authClient.emailOtp.verifyEmail).mockRejectedValue(
				new Error("Network error"),
			);

			const result = await verifyEmailWithOtp("test@example.com", "123456");

			expect(result.success).toBe(false);
			expect(result.data).toBeNull();
			expect(result.error?.message).toBe("Network error");
		});

		it("handles non-Error thrown values", async () => {
			vi.mocked(authClient.emailOtp.verifyEmail).mockRejectedValue(
				"String error",
			);

			const result = await verifyEmailWithOtp("test@example.com", "123456");

			expect(result.success).toBe(false);
			expect(result.error?.message).toBe("Email verification failed");
		});
	});
});
