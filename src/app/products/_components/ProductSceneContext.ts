"use client";

import { createContext } from "react";

export type ProductSceneState = { activeStep: 0 | 1 | 2; progress: number; enabled: boolean };
export const ProductSceneContext = createContext<ProductSceneState | null>(null);
