import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import GenericTimeSeries from './GenericTimeSeries';

// Story d'exemple du starter. Pour un composant de projet, envelopper le rendu dans
// <FigmaReference id="<viz-id>"> (./__fixtures__/FigmaReference) pour l'afficher à côté de
// docs/figma-inventory/visualizations/<viz-id>.png, et caler les données de la story sur les
// valeurs de la maquette pour une comparaison pixel-perfect.
const data = [
  { timestamp: '2019', label: '2019', value: 120 },
  { timestamp: '2020', label: '2020', value: 95 },
  { timestamp: '2021', label: '2021', value: 140 },
  { timestamp: '2022', label: '2022', value: 160 },
  { timestamp: '2023', label: '2023', value: 150 },
];

const meta = {
  title: 'Charts/GenericTimeSeries',
  component: GenericTimeSeries,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof GenericTimeSeries>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { data, title: 'Exemple', xAxisLabel: 'Année', yAxisLabel: 'Valeur' },
};

export const Loading: Story = {
  args: { data: [], isLoading: true },
};

export const Empty: Story = {
  args: { data: [] },
};
