"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Lock, Mail, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

export default function AdminLoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Erreur de connexion');
                toast.error(data.error || 'Erreur de connexion');
                return;
            }

            // Stocker le token
            localStorage.setItem('admin_token', data.token);

            toast.success('Connexion réussie ! 🎉');

            // Rediriger vers le dashboard
            router.push('/admin/dashboard');
        } catch (error) {
            console.error('Login error:', error);
            setError('Erreur lors de la connexion');
            toast.error('Erreur lors de la connexion');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-black p-4">
            <Card className="w-full max-w-md bg-white/5 border-white/10">
                <CardHeader className="text-center space-y-4">
                    <div className="flex justify-center">
                        <Image
                            src="/assets/logo.png"
                            alt="Frechnel"
                            width={60}
                            height={60}
                            className="object-contain"
                        />
                    </div>
                    <div>
                        <CardTitle className="text-2xl font-black text-white">
                            Admin Dashboard
                        </CardTitle>
                        <CardDescription className="text-muted-foreground mt-2">
                            Connectez-vous pour gérer votre boutique
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Email */}
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-white">
                                Email
                            </Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="admin@frechnel.com"
                                    className="pl-10 bg-white/5 border-white/10 text-white"
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-white">
                                Mot de passe
                            </Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="pl-10 bg-white/5 border-white/10 text-white"
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                                <AlertCircle className="h-4 w-4 text-red-500" />
                                <p className="text-sm text-red-500">{error}</p>
                            </div>
                        )}

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary hover:bg-primary/90"
                        >
                            {loading ? "Connexion..." : "Se connecter"}
                        </Button>
                    </form>

                    {/* Dev Info */}

                </CardContent>
            </Card>
        </div>
    );
}
