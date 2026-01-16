import { Loader2 } from "lucide-react";

type Props = {
    size?: number;
    loadingText?: string;
};
export function Spinner({ size, loadingText }: Readonly<Props>) {
    return (
        <div className="flex items-center justify-center gap-2 flex-col">
            <Loader2
                className="animate-spin repeat-infinite duration-700 text-foreground"
                size={size ?? 40}
            />
            {loadingText && <p className="text-foreground font-semibold">{loadingText}</p>}
        </div>
    );
}
