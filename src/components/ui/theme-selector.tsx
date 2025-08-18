import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Palette, Check } from 'lucide-react';

interface ThemeSelectorProps {
  currentTheme?: string;
  onThemeChange?: (theme: string) => void;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({ 
  currentTheme = 'default',
  onThemeChange = () => {}
}) => {
  const themes = [
    {
      id: 'default',
      name: 'Coffee Classic',
      description: 'Warm browns and golden accents',
      colors: {
        primary: 'hsl(25, 50%, 20%)',
        accent: 'hsl(35, 85%, 65%)',
        background: 'hsl(0, 0%, 98%)'
      }
    },
    {
      id: 'warm',
      name: 'Sunrise Blend',
      description: 'Warm oranges and creams',
      colors: {
        primary: 'hsl(25, 60%, 25%)',
        accent: 'hsl(25, 85%, 65%)',
        background: 'hsl(35, 30%, 96%)'
      }
    },
    {
      id: 'cool',
      name: 'Ocean Breeze',
      description: 'Cool blues and whites',
      colors: {
        primary: 'hsl(200, 60%, 25%)',
        accent: 'hsl(200, 85%, 65%)',
        background: 'hsl(200, 30%, 96%)'
      }
    },
    {
      id: 'forest',
      name: 'Forest Fresh',
      description: 'Natural greens and earth tones',
      colors: {
        primary: 'hsl(120, 40%, 20%)',
        accent: 'hsl(120, 50%, 55%)',
        background: 'hsl(120, 20%, 96%)'
      }
    },
    {
      id: 'sunset',
      name: 'Sunset Roast',
      description: 'Warm reds and golds',
      colors: {
        primary: 'hsl(15, 60%, 25%)',
        accent: 'hsl(15, 85%, 65%)',
        background: 'hsl(15, 30%, 96%)'
      }
    }
  ];

  const handleThemeChange = (themeId: string) => {
    // Apply theme to document
    const root = document.documentElement;
    if (themeId === 'default') {
      root.removeAttribute('data-theme');
    } else {
      root.setAttribute('data-theme', themeId);
    }
    onThemeChange(themeId);
  };

  return (
    <Card className="shadow-medium">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Palette className="h-5 w-5 mr-2" />
          Theme Customization
        </CardTitle>
        <CardDescription>
          Choose a theme that matches your cafe's personality
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {themes.map((theme) => (
            <div
              key={theme.id}
              className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:shadow-medium ${
                currentTheme === theme.id 
                  ? 'border-accent bg-accent/5' 
                  : 'border-border hover:border-accent/50'
              }`}
              onClick={() => handleThemeChange(theme.id)}
            >
              {currentTheme === theme.id && (
                <div className="absolute top-2 right-2">
                  <Badge className="bg-accent text-accent-foreground">
                    <Check className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                </div>
              )}
              
              <div className="space-y-3">
                <div className="flex space-x-2">
                  <div 
                    className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                    style={{ backgroundColor: theme.colors.primary }}
                  />
                  <div 
                    className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                    style={{ backgroundColor: theme.colors.accent }}
                  />
                  <div 
                    className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                    style={{ backgroundColor: theme.colors.background }}
                  />
                </div>
                
                <div>
                  <h4 className="font-semibold text-sm">{theme.name}</h4>
                  <p className="text-xs text-muted-foreground">{theme.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 p-4 bg-muted/30 rounded-lg">
          <div className="flex items-start space-x-3">
            <Palette className="h-5 w-5 text-accent mt-0.5" />
            <div>
              <h4 className="font-medium text-sm">Pro Tip</h4>
              <p className="text-xs text-muted-foreground">
                Your theme will be applied to all customer-facing pages including menus and ordering interfaces.
                Choose colors that represent your cafe's brand and atmosphere.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};