import type { Meta } from '@storybook/react';
import { 
  brandScale, 
  grayScale, 
  semanticColors,
  brandSemantic,
  lightModeSemantic,
  darkModeSemantic,
  specialSemantic,
} from './colors';
import { fontSize, fontWeight } from './typography';
import { spacing } from './spacing';
import { borderRadius } from './borderRadius';
import { shadow } from './shadow';

const meta: Meta = {
  title: 'Design System/Foundation/Tokens',
  parameters: {
    layout: 'padded',
  },
};

export default meta;

// ============================================================================
// Primitive Tokens
// ============================================================================

export const BrandScale = () => (
  <div>
    <h3 style={{ marginBottom: '1rem' }}>Brand Color Scale (Primitive Token)</h3>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.75rem' }}>
      {Object.entries(brandScale).map(([key, value]) => (
        <div key={key} style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '100%', 
            height: '80px', 
            backgroundColor: value, 
            borderRadius: '4px',
            marginBottom: '0.5rem',
            border: parseInt(key) >= 400 ? 'none' : '1px solid #e5e7eb'
          }} />
          <div style={{ fontSize: '0.75rem', fontWeight: '600' }}>{key}</div>
          <div style={{ fontSize: '0.625rem', color: '#6b7280', wordBreak: 'break-all' }}>
            {value}
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const GrayScale = () => (
  <div>
    <h3 style={{ marginBottom: '1rem' }}>Gray Scale (Primitive Token)</h3>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.75rem' }}>
      {Object.entries(grayScale).map(([key, value]) => (
        <div key={key} style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '100%', 
            height: '80px', 
            backgroundColor: value, 
            borderRadius: '4px',
            marginBottom: '0.5rem',
            border: parseInt(key) >= 400 ? 'none' : '1px solid #e5e7eb'
          }} />
          <div style={{ fontSize: '0.75rem', fontWeight: '600' }}>{key}</div>
          <div style={{ fontSize: '0.625rem', color: '#6b7280', wordBreak: 'break-all' }}>
            {value}
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const SemanticColorScales = () => (
  <div>
    <h3 style={{ marginBottom: '1rem' }}>Semantic Color Scales (Primitive Tokens)</h3>
    {Object.entries(semanticColors).map(([colorName, scale]) => (
      <div key={colorName} style={{ marginBottom: '2rem' }}>
        <h4 style={{ marginBottom: '0.75rem', textTransform: 'capitalize' }}>{colorName}</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '0.5rem' }}>
          {Object.entries(scale).map(([key, value]) => (
            <div key={key} style={{ textAlign: 'center' }}>
              <div style={{ 
                width: '100%', 
                height: '60px', 
                backgroundColor: value, 
                borderRadius: '4px',
                marginBottom: '0.25rem',
                border: parseInt(key) >= 400 ? 'none' : '1px solid #e5e7eb'
              }} />
              <div style={{ fontSize: '0.625rem', fontWeight: '600' }}>{key}</div>
              <div style={{ fontSize: '0.5rem', color: '#6b7280', wordBreak: 'break-all' }}>
                {value}
              </div>
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);

// ============================================================================
// Semantic Tokens
// ============================================================================

export const BrandSemanticTokens = () => (
  <div>
    <h3 style={{ marginBottom: '1rem' }}>Brand Semantic Tokens</h3>
    <p style={{ marginBottom: '1rem', color: '#6b7280', fontSize: '0.875rem' }}>
      CSS 변수를 참조하는 의미 기반 브랜드 컬러 토큰
    </p>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
      {Object.entries(brandSemantic).map(([key, value]) => (
        <div key={key} style={{ padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
          <div style={{ 
            width: '100%', 
            height: '80px', 
            backgroundColor: value, 
            borderRadius: '4px',
            marginBottom: '0.5rem'
          }} />
          <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{key}</div>
          <div style={{ fontSize: '0.75rem', color: '#6b7280', fontFamily: 'monospace' }}>
            {value}
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const LightModeSemanticTokens = () => (
  <div>
    <h3 style={{ marginBottom: '1rem' }}>Light Mode Semantic Tokens</h3>
    <p style={{ marginBottom: '1rem', color: '#6b7280', fontSize: '0.875rem' }}>
      CSS 변수를 참조하는 의미 기반 라이트 모드 컬러 토큰
    </p>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
      <div>
        <h4 style={{ marginBottom: '0.5rem' }}>Background</h4>
        {Object.entries(lightModeSemantic.background).map(([key, value]) => (
          <div key={key} style={{ 
            padding: '1rem', 
            backgroundColor: value, 
            borderRadius: '4px',
            border: '1px solid #e5e7eb',
            marginBottom: '0.5rem'
          }}>
            <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{key}</div>
            <div style={{ fontSize: '0.75rem', color: '#6b7280', fontFamily: 'monospace' }}>
              {value}
            </div>
          </div>
        ))}
      </div>
      <div>
        <h4 style={{ marginBottom: '0.5rem' }}>Text</h4>
        {Object.entries(lightModeSemantic.text).map(([key, value]) => (
          <div key={key} style={{ 
            padding: '1rem', 
            color: value,
            borderRadius: '4px',
            border: '1px solid #e5e7eb',
            marginBottom: '0.5rem'
          }}>
            <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{key}</div>
            <div style={{ fontSize: '0.75rem', color: '#6b7280', fontFamily: 'monospace' }}>
              {value}
            </div>
          </div>
        ))}
      </div>
      <div>
        <h4 style={{ marginBottom: '0.5rem' }}>Border</h4>
        {Object.entries(lightModeSemantic.border).map(([key, value]) => (
          <div key={key} style={{ 
            padding: '1rem', 
            border: `2px solid ${value}`,
            borderRadius: '4px',
            marginBottom: '0.5rem'
          }}>
            <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{key}</div>
            <div style={{ fontSize: '0.75rem', color: '#6b7280', fontFamily: 'monospace' }}>
              {value}
            </div>
          </div>
        ))}
      </div>
      <div>
        <h4 style={{ marginBottom: '0.5rem' }}>Status</h4>
        {Object.entries(lightModeSemantic.status).map(([key, value]) => (
          <div key={key} style={{ 
            padding: '1rem', 
            backgroundColor: value, 
            borderRadius: '4px',
            marginBottom: '0.5rem',
            color: '#ffffff'
          }}>
            <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{key}</div>
            <div style={{ fontSize: '0.75rem', opacity: 0.9, fontFamily: 'monospace' }}>
              {value}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const DarkModeSemanticTokens = () => (
  <div style={{ padding: '1rem', backgroundColor: '#0F1A14', borderRadius: '8px' }}>
    <h3 style={{ marginBottom: '1rem', color: '#E6F1EA' }}>Dark Mode Semantic Tokens</h3>
    <p style={{ marginBottom: '1rem', color: '#9FB4A8', fontSize: '0.875rem' }}>
      CSS 변수를 참조하는 의미 기반 다크 모드 컬러 토큰
    </p>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
      <div>
        <h4 style={{ marginBottom: '0.5rem', color: '#E6F1EA' }}>Background</h4>
        {Object.entries(darkModeSemantic.background).map(([key, value]) => (
          <div key={key} style={{ 
            padding: '1rem', 
            backgroundColor: value, 
            borderRadius: '4px',
            border: '1px solid #2E4A3B',
            marginBottom: '0.5rem'
          }}>
            <div style={{ fontWeight: '600', marginBottom: '0.25rem', color: '#E6F1EA' }}>{key}</div>
            <div style={{ fontSize: '0.75rem', color: '#9FB4A8', fontFamily: 'monospace' }}>
              {value}
            </div>
          </div>
        ))}
      </div>
      <div>
        <h4 style={{ marginBottom: '0.5rem', color: '#E6F1EA' }}>Text</h4>
        {Object.entries(darkModeSemantic.text).map(([key, value]) => (
          <div key={key} style={{ 
            padding: '1rem', 
            color: value,
            borderRadius: '4px',
            border: '1px solid #2E4A3B',
            marginBottom: '0.5rem'
          }}>
            <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{key}</div>
            <div style={{ fontSize: '0.75rem', color: '#9FB4A8', fontFamily: 'monospace' }}>
              {value}
            </div>
          </div>
        ))}
      </div>
      <div>
        <h4 style={{ marginBottom: '0.5rem', color: '#E6F1EA' }}>Border</h4>
        {Object.entries(darkModeSemantic.border).map(([key, value]) => (
          <div key={key} style={{ 
            padding: '1rem', 
            border: `2px solid ${value}`,
            borderRadius: '4px',
            marginBottom: '0.5rem'
          }}>
            <div style={{ fontWeight: '600', marginBottom: '0.25rem', color: '#E6F1EA' }}>{key}</div>
            <div style={{ fontSize: '0.75rem', color: '#9FB4A8', fontFamily: 'monospace' }}>
              {value}
            </div>
          </div>
        ))}
      </div>
      <div>
        <h4 style={{ marginBottom: '0.5rem', color: '#E6F1EA' }}>Status</h4>
        {Object.entries(darkModeSemantic.status).map(([key, value]) => (
          <div key={key} style={{ 
            padding: '1rem', 
            backgroundColor: value, 
            borderRadius: '4px',
            marginBottom: '0.5rem',
            color: '#ffffff'
          }}>
            <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{key}</div>
            <div style={{ fontSize: '0.75rem', opacity: 0.9, fontFamily: 'monospace' }}>
              {value}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const SpecialSemanticTokens = () => (
  <div>
    <h3 style={{ marginBottom: '1rem' }}>Special Purpose Semantic Tokens</h3>
    <p style={{ marginBottom: '1rem', color: '#6b7280', fontSize: '0.875rem' }}>
      히어로 섹션, Featured 섹션 등 특수 목적용 컬러 토큰
    </p>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
      <div>
        <h4 style={{ marginBottom: '0.5rem' }}>Hero</h4>
        {Object.entries(specialSemantic.hero).map(([key, value]) => (
          <div key={key} style={{ 
            padding: '1rem', 
            backgroundColor: key === 'background' ? value : undefined,
            color: key !== 'background' ? value : undefined,
            borderRadius: '4px',
            border: key !== 'background' ? `2px solid ${value}` : '1px solid #e5e7eb',
            marginBottom: '0.5rem'
          }}>
            <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{key}</div>
            <div style={{ fontSize: '0.75rem', color: '#6b7280', fontFamily: 'monospace' }}>
              {value}
            </div>
          </div>
        ))}
      </div>
      <div>
        <h4 style={{ marginBottom: '0.5rem' }}>Featured</h4>
        {Object.entries(specialSemantic.featured).map(([key, value]) => (
          <div key={key} style={{ 
            padding: '1rem', 
            backgroundColor: key === 'background' ? value : undefined,
            color: key === 'header' || key === 'text' || key === 'link' ? value : undefined,
            borderRadius: '4px',
            border: key === 'divider' ? `2px solid ${value}` : '1px solid #e5e7eb',
            marginBottom: '0.5rem'
          }}>
            <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{key}</div>
            <div style={{ fontSize: '0.75rem', color: '#6b7280', fontFamily: 'monospace' }}>
              {value}
            </div>
          </div>
        ))}
      </div>
      <div>
        <h4 style={{ marginBottom: '0.5rem' }}>Utility</h4>
        <div style={{ 
          padding: '1rem', 
          backgroundColor: specialSemantic.github, 
          borderRadius: '4px',
          marginBottom: '0.5rem',
          color: '#ffffff'
        }}>
          <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>GitHub</div>
          <div style={{ fontSize: '0.75rem', opacity: 0.9, fontFamily: 'monospace' }}>
            {specialSemantic.github}
          </div>
        </div>
        <div style={{ 
          padding: '1rem', 
          backgroundColor: '#7FAF8A',
          color: specialSemantic.buttonText,
          borderRadius: '4px',
          marginBottom: '0.5rem'
        }}>
          <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>Button Text</div>
          <div style={{ fontSize: '0.75rem', opacity: 0.9, fontFamily: 'monospace' }}>
            {specialSemantic.buttonText}
          </div>
        </div>
      </div>
    </div>
  </div>
);


// ============================================================================
// Other Tokens
// ============================================================================

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
          backgroundColor: brandScale[400],
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
          backgroundColor: brandScale[400],
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
