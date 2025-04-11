import { ImageResponse } from 'next/og'
import { getFeaturedCampaign } from '@/lib/campaigns'
import { formatPrice } from '@/lib/utils'

export const runtime = 'edge'

export async function GET() {
  const campaign = await getFeaturedCampaign()
  
  const size = {
    width: 1200,
    height: 630,
  }
  
  if (!campaign) {
    return new ImageResponse(
      (
        <div
          style={{
            fontSize: 60,
            background: 'white',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px',
          }}
        >
          <div style={{ fontSize: 40, marginBottom: 20 }}>FastFilms</div>
          <div style={{ fontSize: 24, color: '#666' }}>
            Community Cinema Crowdfunding
          </div>
        </div>
      ),
      size
    )
  }

  return new ImageResponse(
    (
      <div
        style={{
          background: 'white',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          padding: '40px',
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
        }}
      >
        <div style={{ display: 'flex', gap: '40px', flex: 1 }}>
          <div style={{ flex: 1 }}>
            <div style={{ 
              fontSize: 48, 
              fontWeight: 'bold',
              marginBottom: 16,
              lineHeight: 1.2,
              background: 'linear-gradient(90deg, #000000 0%, #333333 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
            }}>
              {campaign.movieTitle}
            </div>
            <div style={{ 
              fontSize: 32, 
              color: '#666',
              marginBottom: 16,
              lineHeight: 1.2,
            }}>
              {campaign.title}
            </div>
            <div style={{ 
              fontSize: 24, 
              color: '#666',
              marginBottom: 24,
              lineHeight: 1.4,
            }}>
              {campaign.description}
            </div>
            <div style={{ 
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              marginBottom: 24,
            }}>
              <div style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#10B981',
              }} />
              <div style={{ 
                fontSize: 24, 
                color: '#666',
                fontWeight: 500,
              }}>
                {formatPrice(campaign.currentFunding)} raised
              </div>
            </div>
            <div style={{ 
              width: '100%',
              height: 8,
              background: '#E5E7EB',
              borderRadius: 4,
              overflow: 'hidden',
            }}>
              <div style={{ 
                width: `${(campaign.currentFunding / campaign.fundingTarget) * 100}%`,
                height: '100%',
                background: '#10B981',
              }} />
            </div>
            <div style={{ 
              fontSize: 20, 
              color: '#666',
              marginTop: 8,
            }}>
              Target: {formatPrice(campaign.fundingTarget)}
            </div>
          </div>
          {campaign.posterPath && (
            <div style={{ 
              width: '300px', 
              height: '450px', 
              position: 'relative',
              borderRadius: 8,
              overflow: 'hidden',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            }}>
              <div
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  backgroundImage: `url(https://image.tmdb.org/t/p/w500${campaign.posterPath})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
            </div>
          )}
        </div>
        <div style={{ 
          marginTop: 'auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: 20,
          borderTop: '1px solid #E5E7EB',
        }}>
          <div style={{ 
            fontSize: 20, 
            color: '#666',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="#666"/>
              <path d="M12.5 7H11V13L16.2 16.2L17 14.9L12.5 12.2V7Z" fill="#666"/>
            </svg>
            {new Date(campaign.screeningDate).toLocaleDateString('en-GB', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
          <div style={{ 
            fontSize: 20, 
            color: '#666',
            fontWeight: 500,
          }}>
            fastfilms.vercel.app
          </div>
        </div>
      </div>
    ),
    size
  )
} 