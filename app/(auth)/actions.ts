'use server'

import { auth } from "@/lib/auth";
import { isAPIError } from "better-auth/api";
import { headers } from "next/headers";

interface RegisterType {
	name: string,
	email: string,
	password: string,
}

interface LoginType {
	email: string,
	password: string,
	rememberMe?: boolean,
}

export async function register({ name, email, password }: RegisterType) {
	await auth.api.signUpEmail({
		body: {
			name,
			email,
			password,
		}
	})
}

export async function login({ email, password, rememberMe }: LoginType) {
	try {
		const data = await auth.api.signInEmail({
			body: {
				email,
				password,
				rememberMe
			},
			headers: await headers(),
		})

		return { success: true, data }
	} catch (err) {
		if (isAPIError(err)) {
			return {
				success: false,
				error: err.message,
			}
		}
	}
}
