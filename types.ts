export enum Waveform {
  SINE = 'SINE',
  TRIANGLE = 'TRI',
  SAWTOOTH = 'SAW',
  SQUARE = 'SQR',
  PULSE = 'PULSE'
}

export enum FilterType {
  LP_24 = 'LP 24dB',
  LP_12 = 'LP 12dB',
  HP = 'HP',
  BP = 'BP'
}

export interface KnobProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  size?: 'sm' | 'md' | 'lg';
  color?: 'silver' | 'gold' | 'black';
  formatValue?: (val: number) => string;
}

export interface SwitchProps {
  label: string;
  value: boolean;
  onChange: (val: boolean) => void;
  vertical?: boolean;
}
