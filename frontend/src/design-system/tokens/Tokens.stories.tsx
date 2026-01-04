import type { Meta } from '@storybook/react';
import { brandColors, lightModeColors, darkModeColors } from './colors';
import { fontSize, fontWeight } from './typography';
import { spacing } from './spacing';
import { borderRadius } from './borderRadius';
import { shadow } from './shadow';

const meta: Meta = {
  title: 'Design System/Tokens',
  parameters: {
    layout: 'padded',
  },
};

export default meta;

export const BrandColors = () => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
    <div style={{ padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
      <div style={{ 
        width: '100%', 
        height: '80px', 
        backgroundColor: brandColors.primary, 
        borderRadius: '4px',
        marginBottom: '0.5rem'
      }} />
      <div style={{ fontWeight: '600' }}>Primary</div>
      <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{brandColors.primary}</div>
      <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Fresh Olive Green</div>
    </div>
    <div style={{ padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
      <div style={{ 
        width: '100%', 
        height: '80px', 
        backgroundColor: brandColors.accent, 
        borderRadius: '4px',
        marginBottom: '0.5rem'
      }} />
      <div style={{ fontWeight: '600' }}>Accent</div>
      <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{brandColors.accent}</div>
      <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Muted Olive (Updated)</div>
    </div>
    <div style={{ padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
      <div style={{ 
        width: '100%', 
        height: '80px', 
        backgroundColor: brandColors.success, 
        borderRadius: '4px',
        marginBottom: '0.5rem'
      }} />
      <div style={{ fontWeight: '600' }}>Success</div>
      <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{brandColors.success}</div>
      <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Light Sage (Updated)</div>
    </div>
    <div style={{ padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
      <div style={{ 
        width: '100%', 
        height: '80px', 
        backgroundColor: brandColors.highlight, 
        borderRadius: '4px',
        marginBottom: '0.5rem',
        border: '1px solid #e5e7eb'
      }} />
      <div style={{ fontWeight: '600' }}>Highlight</div>
      <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{brandColors.highlight}</div>
      <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Soft Green (Updated)</div>
    </div>
  </div>
);

export const LightModeColors = () => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
    <div>
      <h4 style={{ marginBottom: '0.5rem' }}>Background</h4>
      <div style={{ 
        padding: '1rem', 
        backgroundColor: lightModeColors.background.primary, 
        borderRadius: '4px',
        border: '1px solid #e5e7eb',
        marginBottom: '0.25rem'
      }}>
        Primary: {lightModeColors.background.primary}
      </div>
      <div style={{ 
        padding: '1rem', 
        backgroundColor: lightModeColors.background.secondary, 
        borderRadius: '4px',
        border: '1px solid #e5e7eb',
        marginBottom: '0.25rem'
      }}>
        Secondary: {lightModeColors.background.secondary}
      </div>
      <div style={{ 
        padding: '1rem', 
        backgroundColor: lightModeColors.background.tertiary, 
        borderRadius: '4px',
        border: '1px solid #e5e7eb'
      }}>
        Tertiary: {lightModeColors.background.tertiary}
      </div>
    </div>
    <div>
      <h4 style={{ marginBottom: '0.5rem' }}>Text</h4>
      <div style={{ 
        padding: '1rem', 
        color: lightModeColors.text.primary,
        borderRadius: '4px',
        border: '1px solid #e5e7eb',
        marginBottom: '0.25rem'
      }}>
        Primary: {lightModeColors.text.primary}
      </div>
      <div style={{ 
        padding: '1rem', 
        color: lightModeColors.text.secondary,
        borderRadius: '4px',
        border: '1px solid #e5e7eb',
        marginBottom: '0.25rem'
      }}>
        Secondary: {lightModeColors.text.secondary}
      </div>
      <div style={{ 
        padding: '1rem', 
        color: lightModeColors.text.tertiary,
        borderRadius: '4px',
        border: '1px solid #e5e7eb'
      }}>
        Tertiary: {lightModeColors.text.tertiary}
      </div>
    </div>
    <div>
      <h4 style={{ marginBottom: '0.5rem' }}>Border</h4>
      <div style={{ 
        padding: '1rem', 
        border: `2px solid ${lightModeColors.border.default}`,
        borderRadius: '4px',
        marginBottom: '0.25rem'
      }}>
        Default: {lightModeColors.border.default}
      </div>
      <div style={{ 
        padding: '1rem', 
        border: `2px solid ${lightModeColors.border.hover}`,
        borderRadius: '4px',
        marginBottom: '0.25rem'
      }}>
        Hover: {lightModeColors.border.hover}
      </div>
      <div style={{ 
        padding: '1rem', 
        border: `2px solid ${lightModeColors.border.accent}`,
        borderRadius: '4px'
      }}>
        Accent: {lightModeColors.border.accent}
      </div>
    </div>
  </div>
);

export const DarkModeColors = () => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem', padding: '1rem', backgroundColor: '#0F1A14', borderRadius: '8px' }}>
    <div style={{ padding: '1rem', backgroundColor: '#16241C', borderRadius: '8px' }}>
      <div style={{ 
        width: '100%', 
        height: '80px', 
        backgroundColor: brandColors.primaryDark, 
        borderRadius: '4px',
        marginBottom: '0.5rem'
      }} />
      <div style={{ fontWeight: '600', color: '#E6F1EA' }}>Primary (Dark)</div>
      <div style={{ fontSize: '0.875rem', color: '#94a3b8' }}>{brandColors.primaryDark}</div>
      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Vital Deep Green</div>
    </div>
    <div style={{ padding: '1rem', backgroundColor: '#16241C', borderRadius: '8px' }}>
      <div style={{ 
        width: '100%', 
        height: '80px', 
        backgroundColor: darkModeColors.background.primary, 
        borderRadius: '4px',
        marginBottom: '0.5rem',
        border: '1px solid #2E4A3B'
      }} />
      <div style={{ fontWeight: '600', color: '#E6F1EA' }}>Background</div>
      <div style={{ fontSize: '0.875rem', color: '#94a3b8' }}>{darkModeColors.background.primary}</div>
      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>그린 기운 다크</div>
    </div>
    <div style={{ padding: '1rem', backgroundColor: '#16241C', borderRadius: '8px' }}>
      <div style={{ 
        width: '100%', 
        height: '80px', 
        backgroundColor: darkModeColors.text.primary, 
        borderRadius: '4px',
        marginBottom: '0.5rem',
        border: '1px solid #2E4A3B'
      }} />
      <div style={{ fontWeight: '600', color: '#E6F1EA' }}>Text Primary</div>
      <div style={{ fontSize: '0.875rem', color: '#94a3b8' }}>{darkModeColors.text.primary}</div>
      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>부드러운 라이트 그린</div>
    </div>
  </div>
);

export const Typography = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
    <div>
      <div style={{ fontSize: fontSize.display, fontWeight: 700, marginBottom: '0.25rem' }}>
        Display: {fontSize.display}
      </div>
      <div style={{ fontSize: fontSize.h1, fontWeight: 700, marginBottom: '0.25rem' }}>
        H1: {fontSize.h1}
      </div>
      <div style={{ fontSize: fontSize.h2, fontWeight: 600, marginBottom: '0.25rem' }}>
        H2: {fontSize.h2}
      </div>
      <div style={{ fontSize: fontSize.h3, fontWeight: 600, marginBottom: '0.25rem' }}>
        H3: {fontSize.h3}
      </div>
      <div style={{ fontSize: fontSize.h4, fontWeight: 600, marginBottom: '0.25rem' }}>
        H4: {fontSize.h4}
      </div>
      <div style={{ fontSize: fontSize.base }}>
        Base: {fontSize.base}
      </div>
    </div>
  </div>
);

export const Spacing = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
    {Object.entries(spacing).map(([key, value]) => (
      <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ width: '60px', fontSize: '0.875rem', fontWeight: '600' }}>
          {key}
        </div>
        <div style={{ 
          width: value, 
          height: '24px', 
          backgroundColor: brandColors.primary,
          borderRadius: '4px'
        }} />
        <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
          {value}
        </div>
      </div>
    ))}
  </div>
);

export const BorderRadius = () => (
  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
    {Object.entries(borderRadius).map(([key, value]) => (
      <div key={key} style={{ textAlign: 'center' }}>
        <div style={{ 
          width: '80px', 
          height: '80px', 
          backgroundColor: brandColors.primary,
          borderRadius: value,
          marginBottom: '0.5rem'
        }} />
        <div style={{ fontSize: '0.875rem', fontWeight: '600' }}>{key}</div>
        <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{value}</div>
      </div>
    ))}
  </div>
);

export const Shadows = () => (
  <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
    {Object.entries(shadow).map(([key, value]) => (
      <div key={key} style={{ textAlign: 'center' }}>
        <div style={{ 
          width: '120px', 
          height: '120px', 
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          boxShadow: value,
          border: '1px solid #e5e7eb',
          marginBottom: '0.5rem'
        }} />
        <div style={{ fontSize: '0.875rem', fontWeight: '600' }}>{key}</div>
        <div style={{ fontSize: '0.75rem', color: '#6b7280', maxWidth: '120px', wordBreak: 'break-all' }}>
          {value}
        </div>
      </div>
    ))}
  </div>
);
