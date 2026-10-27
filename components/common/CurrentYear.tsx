"use client";
import { useEffect, useState } from "react";

const CurrentYear = () => {
    const [year, setYear] = useState(2026);

    useEffect(() => {
        setYear(new Date().getFullYear());
    }, []);

    return <span>{year ?? ""}</span>;
}
export default CurrentYear