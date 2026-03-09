export interface ButtonProps{
    title: string;
    action:()=>void;
    variant: 'solid' | 'outline' | 'disabled';
    size: 'sm' | 'lg';
    classes?: string;
}