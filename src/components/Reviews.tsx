"use client"
import Image from "next/image";
import MaxWithWrapper from "./MaxWithWrapper";
import { HTMLAttributes, useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import { cn } from "@/lib/utils";
import Phone from "./Phone";

const Phones = [
    '/testimonials/2.jpg',
    '/testimonials/3.jpg',
    '/testimonials/4.jpg',
    '/testimonials/5.jpg',
    '/testimonials/6.jpg',
    '/testimonials/7.jpg'
];

function splitArray<T>(array: Array<T>, numParts: number) {
    const result: Array<Array<T>> = Array.from({ length: numParts }, () => []);

    array.forEach((item, index) => {
        result[index % numParts].push(item);
    });

    return result;
}

function ReviewColumn({
    reviews,
    className,
    reviewClassName,
    msPerPixel = 0,
}: {
    reviews: string[]
    className?: string
    reviewClassName?: (reviewIndex: number) => string
    msPerPixel?: number
}) {
    const columnRef = useRef<HTMLDivElement | null>(null)
    const [columnHeight, setColumnHeight] = useState(0)
    const duration = `${columnHeight * msPerPixel}ms`

    useEffect(() => {
        if (!columnRef.current) return

        const resizeObserver = new window.ResizeObserver(() => {
            setColumnHeight(columnRef.current?.offsetHeight ?? 0)
        })

        resizeObserver.observe(columnRef.current)

        return () => {
            resizeObserver.disconnect()
        }
    }, [])

    return (
        <div
            ref={columnRef}
            className={cn('animate-marquee space-y-8 py-4', className)}
            style={{ '--marquee-duration': duration } as React.CSSProperties}>
            {reviews.concat(reviews).map((imgSrc, reviewIndex) => (
                <Review
                    key={reviewIndex}
                    className={reviewClassName?.(reviewIndex % reviews.length)}
                    imgSrc={imgSrc}
                />
            ))}
        </div>
    )
}

interface reviewProps extends HTMLAttributes<HTMLDivElement> {
    imgSrc: string
}

function Review({ imgSrc, className, ...props }: reviewProps) {
    const possible_animation_delays = ['0s', '0.1s', '0.2s', '0.3s', '0.4s', '0.5s'];
    const animationDelay = possible_animation_delays[Math.floor(Math.random() * possible_animation_delays.length)];

    return (
        <div className={cn('animate-fade-in rounded-[2.25rem] bg-white p-6 w-fit opacity-0 shadow-xl shadow-slate-900/5', className)}
            style={{ animationDelay }}
            {...props}>
            <Phone imgScr={imgSrc} />
        </div>
    );
}

function ReviewGrid() {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const isInView = useInView(containerRef, { once: true, amount: 0.4 });
    const columns = splitArray(Phones, 3);
    const columns1 = columns[0];
    const columns2 = columns[1];
    const columns3 = splitArray(columns[2], 2);

    return (
        <div ref={containerRef} className="relative -mx-4 mt-16 grid h-[49rem] mx-h-[150vh] grid-cols-1 items-start gap-8 overflow-hidden px-4 sm:mt-20 md:grid-cols-2 lg:grid-cols-3">
            {isInView ? (
                <>
                    <ReviewColumn reviews={[...columns1, ...columns3.flat(), ...columns2]}
                        reviewClassName={(reviewIndex) => cn({
                            'md:hidden': reviewIndex >= columns1.length + columns3[0].length,
                            'lg:hidden': reviewIndex >= columns1.length,
                        })}
                        msPerPixel={10} />

                    <ReviewColumn reviews={[...columns2, ...(columns3[1] || [])]}
                        className='hidden md:block'
                        reviewClassName={(reviewIndex) => reviewIndex >= columns2.length ? 'lg:hidden' : ''}
                        msPerPixel={15} />

                    <ReviewColumn reviews={columns3.flat()}
                        className='hidden md:block'
                        msPerPixel={10} />
                </>
            ) : null}

            <div className='pointer-events-none  absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-slate-100'></div>
            <div className='pointer-events-none  absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-slate-100'></div>
        </div>
    );
}

function Reviews() {
    return (
        <MaxWithWrapper className="relative max-w-5xl flex items-center justify-center">
            <Image
                width={200} height={200}
                src='/what-people-are-buying.png'
                alt='people'
                className='absolute select-none hidden xl:block -left-32 top-1/3 w-40 lg:w-52'
                aria-hidden='true' />

            <ReviewGrid />
        </MaxWithWrapper>
    );
}

export default Reviews;
