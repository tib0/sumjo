import { createContext } from 'react';
import { type TensorflowPlugin } from 'react-native-fast-tflite';

export const SumjoModelContext = createContext<TensorflowPlugin | null>(null);