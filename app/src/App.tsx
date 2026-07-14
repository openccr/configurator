// SPDX-License-Identifier: GPL-3.0-or-later
// Copyright (c) 2026 openCCR contributors

import Button from './components/ui/Button';
import Card from './components/ui/Card';
import Badge from './components/ui/Badge';
import SafetyWarning from './components/ui/SafetyWarning';
import SectionHeader from './components/ui/SectionHeader';

export default function App() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ color: 'var(--color-navy)', fontFamily: 'var(--font-heading)' }}>
        openCCR Configurator
      </h1>
      <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <Button variant="primary">Primary</Button>
        <Button variant="outline">Outline</Button>
        <Button
          variant="outline-light"
          style={{ background: 'var(--color-navy)', padding: '0.5rem' }}
        >
          Outline Light
        </Button>
      </div>
      <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
        <Badge variant="navy">Navy</Badge>
        <Badge variant="ocean">Ocean</Badge>
        <Badge variant="cyan">Cyan</Badge>
      </div>
      <div style={{ marginTop: '1rem', maxWidth: '400px' }}>
        <Card title="Example Card">This is a placeholder card for the openCCR configurator.</Card>
      </div>
      <div style={{ marginTop: '1rem', maxWidth: '500px' }}>
        <SafetyWarning title="Safety Notice">
          This is a placeholder safety warning component — reserved for CCR safety-critical notices
          only.
        </SafetyWarning>
      </div>
      <div style={{ marginTop: '2rem' }}>
        <SectionHeader
          eyebrow="Getting Started"
          title="Configure Your CCR"
          subtitle="Select your device and configure parameters safely."
        />
      </div>
    </div>
  );
}
