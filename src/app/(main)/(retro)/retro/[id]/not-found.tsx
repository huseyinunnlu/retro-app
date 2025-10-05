'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React from 'react'
import { SearchX, Home, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'

export default function RetroNotFound() {
    const router = useRouter()
    return (
        <div className="w-full h-screen flex items-center justify-center p-4">
            <Card className="max-w-md w-full text-center">
                <CardHeader className="items-center space-y-4 pb-4">
                    <div className="rounded-full bg-muted p-4">
                        <SearchX className="size-12 text-muted-foreground" />
                    </div>
                    <div className="space-y-2">
                        <CardTitle className="text-2xl">
                            Retro Not Found
                        </CardTitle>
                        <CardDescription className="text-base">
                            The retrospective you&apos;re looking for
                            doesn&apos;t exist or you don&apos;t have permission
                            to view it.
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        This could happen if:
                    </p>
                    <ul className="text-sm text-muted-foreground space-y-2 text-left list-disc list-inside">
                        <li>The retro has been deleted</li>
                        <li>
                            You don&apos;t have access to this team&apos;s
                            retros
                        </li>
                        <li>The link you followed is incorrect</li>
                    </ul>
                </CardContent>
                <CardFooter className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button variant="outline" asChild>
                        <Link href="/">
                            <Home />
                            Go to Dashboard
                        </Link>
                    </Button>
                    <Button variant="default" onClick={() => router.back()}>
                        <ArrowLeft />
                        Go Back
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}
