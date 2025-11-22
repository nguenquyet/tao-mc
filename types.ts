export interface AnchorOptions {
  prompt: string;
  gender: string;
  ethnicity: string;
  hairStyle: string;
  hairColor: string;
  eyeStyle: string;
  eyeColor: string;
  clothing: string;
  clothingDetails: string;
  background: string;
  aspectRatio: string;
  age: string;
  expression: string;
}

export interface FaceImage {
  base64: string;
  mimeType: string;
}

export interface Template {
  name: string;
  options: AnchorOptions;
}
