import type { Meta } from '@storybook/react';
import { 
  brandScale, 
  grayScale, 
  semanticColors,
  brandSemantic,
  lightModeSemantic,
  darkModeSemantic,
  utilitySemantic,
  specialSemantic,
} from './colors';

const meta: Meta = {
  title: 'Design System/Foundation/Colors',
  parameters: {
    layout: 'padded',
  },
};

export default meta;

// ============================================================================
// 모든 컬러를 한눈에 보는 통합 스토리
// ============================================================================

/**
 * 프로젝트에서 사용되는 모든 컬러를 모아놓은 통합 뷰
 * 
 * 이 스토리는 디자인시스템에 등록된 모든 컬러 토큰을 한 곳에서 확인할 수 있도록 합니다.
 * 
 * 구조:
 * 1. Primitive Tokens (기본 컬러 팔레트)
 *    - brandScale: 브랜드 그린 기반 색상 스케일
 *    - grayScale: 중립 회색 스케일
 *    - semanticColors: 의미 기반 색상 스케일 (blue, green, amber, red, purple, yellow)
 * 
 * 2. Semantic Tokens (의미 기반 컬러)
 *    - brandSemantic: 브랜드 컬러 의미 토큰
 *    - lightModeSemantic: 라이트 모드 의미 토큰
 *    - darkModeSemantic: 다크 모드 의미 토큰
 *    - utilitySemantic: 유틸리티 컬러 (white, black, tooltip, shadow, glass)
 *    - specialSemantic: 특수 목적 의미 토큰 (히어로, Featured 등)
 */
export const AllColors = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem', padding: '2rem' }}>
    {/* Primitive Tokens */}
    <section>
      <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: '700' }}>
        Primitive Tokens (기본 컬러 팔레트)
      </h2>
      <p style={{ marginBottom: '2rem', color: '#6b7280', fontSize: '0.875rem' }}>
        기본 컬러 팔레트입니다. 직접 사용하지 않고 semantic tokens를 통해 사용하는 것을 권장합니다.
      </p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Brand Scale */}
        <div>
          <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem', fontWeight: '600' }}>
            Brand Scale
          </h3>
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

        {/* Gray Scale */}
        <div>
          <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem', fontWeight: '600' }}>
            Gray Scale
          </h3>
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

        {/* Semantic Color Scales */}
        <div>
          <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem', fontWeight: '600' }}>
            Semantic Color Scales
          </h3>
          {Object.entries(semanticColors).map(([colorName, scale]) => (
            <div key={colorName} style={{ marginBottom: '2rem' }}>
              <h4 style={{ marginBottom: '0.75rem', textTransform: 'capitalize', fontSize: '1rem', fontWeight: '600' }}>
                {colorName}
              </h4>
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
      </div>
    </section>

    {/* Semantic Tokens */}
    <section>
      <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: '700' }}>
        Semantic Tokens (의미 기반 컬러)
      </h2>
      <p style={{ marginBottom: '2rem', color: '#6b7280', fontSize: '0.875rem' }}>
        CSS 변수를 참조하는 의미 기반 컬러 토큰입니다. 테마 변경에 자동으로 대응됩니다.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Brand Semantic Tokens */}
        <div>
          <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem', fontWeight: '600' }}>
            Brand Semantic Tokens
          </h3>
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

        {/* Light Mode Semantic Tokens */}
        <div>
          <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem', fontWeight: '600' }}>
            Light Mode Semantic Tokens
          </h3>
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
            <div>
              <h4 style={{ marginBottom: '0.5rem' }}>Link</h4>
              {Object.entries(lightModeSemantic.link).map(([key, value]) => (
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
          </div>
        </div>

        {/* Dark Mode Semantic Tokens */}
        <div style={{ padding: '1rem', backgroundColor: '#0F1A14', borderRadius: '8px' }}>
          <h3 style={{ marginBottom: '1rem', color: '#E6F1EA', fontSize: '1.25rem', fontWeight: '600' }}>
            Dark Mode Semantic Tokens
          </h3>
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
            <div>
              <h4 style={{ marginBottom: '0.5rem', color: '#E6F1EA' }}>Link</h4>
              {Object.entries(darkModeSemantic.link).map(([key, value]) => (
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
          </div>
        </div>

        {/* Utility Semantic Tokens */}
        <div>
          <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem', fontWeight: '600' }}>
            Utility Semantic Tokens
          </h3>
          <p style={{ marginBottom: '1rem', color: '#6b7280', fontSize: '0.875rem' }}>
            라이트/다크 모드 공통으로 사용되는 유틸리티 컬러입니다.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            {/* White & Black */}
            <div>
              <h4 style={{ marginBottom: '0.5rem' }}>Neutral</h4>
              <div style={{ 
                padding: '1rem', 
                backgroundColor: utilitySemantic.white, 
                borderRadius: '4px',
                border: '1px solid #e5e7eb',
                marginBottom: '0.5rem',
                color: '#000'
              }}>
                <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>white</div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280', fontFamily: 'monospace' }}>
                  {utilitySemantic.white}
                </div>
              </div>
              <div style={{ 
                padding: '1rem', 
                backgroundColor: utilitySemantic.black, 
                borderRadius: '4px',
                border: '1px solid #e5e7eb',
                marginBottom: '0.5rem',
                color: '#fff'
              }}>
                <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>black</div>
                <div style={{ fontSize: '0.75rem', color: '#9FB4A8', fontFamily: 'monospace' }}>
                  {utilitySemantic.black}
                </div>
              </div>
            </div>

            {/* Tooltip */}
            <div>
              <h4 style={{ marginBottom: '0.5rem' }}>Tooltip</h4>
              <div style={{ 
                padding: '1rem', 
                backgroundColor: utilitySemantic.tooltip.background, 
                borderRadius: '4px',
                marginBottom: '0.5rem',
                color: utilitySemantic.tooltip.text
              }}>
                <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>background</div>
                <div style={{ fontSize: '0.75rem', opacity: 0.9, fontFamily: 'monospace' }}>
                  {utilitySemantic.tooltip.background}
                </div>
              </div>
              <div style={{ 
                padding: '1rem', 
                backgroundColor: '#f9fafb',
                borderRadius: '4px',
                border: '1px solid #e5e7eb',
                marginBottom: '0.5rem',
                color: utilitySemantic.tooltip.text
              }}>
                <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>text</div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280', fontFamily: 'monospace' }}>
                  {utilitySemantic.tooltip.text}
                </div>
              </div>
            </div>

            {/* Shadow */}
            <div>
              <h4 style={{ marginBottom: '0.5rem' }}>Shadow</h4>
              {Object.entries(utilitySemantic.shadow).map(([key, value]) => (
                <div key={key} style={{ 
                  padding: '1rem', 
                  backgroundColor: '#ffffff',
                  borderRadius: '4px',
                  border: '1px solid #e5e7eb',
                  marginBottom: '0.5rem',
                  boxShadow: value
                }}>
                  <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{key}</div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                    {value}
                  </div>
                </div>
              ))}
            </div>

            {/* Glass */}
            <div>
              <h4 style={{ marginBottom: '0.5rem' }}>Glass</h4>
              {Object.entries(utilitySemantic.glass).map(([key, value]) => (
                <div key={key} style={{ 
                  padding: '1rem', 
                  background: `linear-gradient(135deg, ${value} 0%, ${value} 100%)`,
                  backgroundColor: '#1f2937',
                  borderRadius: '4px',
                  border: '1px solid #e5e7eb',
                  marginBottom: '0.5rem',
                  color: '#fff'
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

        {/* Special Semantic Tokens */}
        <div>
          <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem', fontWeight: '600' }}>
            Special Purpose Semantic Tokens
          </h3>
          <p style={{ marginBottom: '1rem', color: '#6b7280', fontSize: '0.875rem' }}>
            히어로 섹션, Featured 섹션 등 특수 목적용 컬러 토큰입니다.
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
                backgroundColor: specialSemantic.githubHover, 
                borderRadius: '4px',
                marginBottom: '0.5rem',
                color: '#ffffff'
              }}>
                <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>GitHub Hover</div>
                <div style={{ fontSize: '0.75rem', opacity: 0.9, fontFamily: 'monospace' }}>
                  {specialSemantic.githubHover}
                </div>
              </div>
              <div style={{ 
                padding: '1rem', 
                backgroundColor: specialSemantic.live, 
                borderRadius: '4px',
                marginBottom: '0.5rem',
                color: '#ffffff'
              }}>
                <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>Live</div>
                <div style={{ fontSize: '0.75rem', opacity: 0.9, fontFamily: 'monospace' }}>
                  {specialSemantic.live}
                </div>
              </div>
              <div style={{ 
                padding: '1rem', 
                backgroundColor: specialSemantic.liveHover, 
                borderRadius: '4px',
                marginBottom: '0.5rem',
                color: '#ffffff'
              }}>
                <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>Live Hover</div>
                <div style={{ fontSize: '0.75rem', opacity: 0.9, fontFamily: 'monospace' }}>
                  {specialSemantic.liveHover}
                </div>
              </div>
              <div style={{ 
                padding: '1rem', 
                backgroundColor: specialSemantic.notion, 
                borderRadius: '4px',
                marginBottom: '0.5rem',
                color: '#ffffff'
              }}>
                <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>Notion</div>
                <div style={{ fontSize: '0.75rem', opacity: 0.9, fontFamily: 'monospace' }}>
                  {specialSemantic.notion}
                </div>
              </div>
              <div style={{ 
                padding: '1rem', 
                backgroundColor: specialSemantic.notionHover, 
                borderRadius: '4px',
                marginBottom: '0.5rem',
                color: '#ffffff'
              }}>
                <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>Notion Hover</div>
                <div style={{ fontSize: '0.75rem', opacity: 0.9, fontFamily: 'monospace' }}>
                  {specialSemantic.notionHover}
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
              <div style={{ 
                padding: '1rem', 
                backgroundColor: '#f9fafb',
                borderRadius: '4px',
                border: '1px solid #e5e7eb',
                marginBottom: '0.5rem',
                color: specialSemantic.disabled
              }}>
                <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>Disabled</div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280', fontFamily: 'monospace' }}>
                  {specialSemantic.disabled}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
);
