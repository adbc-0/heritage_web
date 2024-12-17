import { LockKeyhole } from "lucide-react";
import { FormEvent, useId } from "react";

import { ENV } from "@/constants/Env";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type LoginFormInputs = {
    password: string;
};

type LoginFormProps = {
    authorize: () => void;
};

const AuthorizationRoute = `${ENV.API_URL}/auth`;

export function LoginForm({ authorize }: LoginFormProps) {
    const passwordId = useId();
    async function login(e: FormEvent) {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);
        const formJson = Object.fromEntries(formData.entries()) as LoginFormInputs;
        const basicAuthString = btoa(`user:${formJson.password}`);
        const response = await fetch(AuthorizationRoute, {
            method: "POST",
            headers: {
                Authorization: `Basic ${basicAuthString}`,
            },
            credentials: "include",
        });
        if (response.status === 401) {
            return;
        }
        if (!response.ok) {
            return;
        }
        authorize();
    }
    return (
        <div className="h-screen flex items-center justify-center border border-border">
            <form onSubmit={(e) => void login(e)}>
                <div className="flex flex-col gap-2 items-center p-5 border border-border rounded-t-md">
                    <LockKeyhole size={60} />
                    <h1 className="text-xl font-bold tracking-tight mt-2">Wymagane hasło</h1>
                    <p className="text-sm text-muted-foreground">
                        Dostęp do zasobów jest chroniony hasłem
                    </p>
                </div>
                <div className="bg-background-darker p-5 border border-border rounded-b-md border-t-0">
                    <Label className="text-xs text-muted-foreground" htmlFor={passwordId}>
                        HASŁO
                    </Label>
                    <Input
                        id={passwordId}
                        className="bg-white"
                        type="password"
                        name="password"
                        autoComplete="current-password"
                    />
                    <Button className="w-full mt-3" type="submit">
                        Wyślij
                    </Button>
                </div>
            </form>
        </div>
    );
}
