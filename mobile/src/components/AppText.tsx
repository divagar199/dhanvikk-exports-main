import React from 'react';
import { Text, TextProps, TextStyle } from 'react-native';
import { Colors, Typography } from '../theme';

export interface AppTextProps extends TextProps {
  variant?:
    | 'display'
    | 'h1'
    | 'h2'
    | 'h3'
    | 'body'
    | 'bodySm'
    | 'caption'
    | 'button'
    | 'price'
    | 'heroPrice'
    | 'editorialHero'
    | 'editorialKicker';
  color?: string;
  weight?: 'regular' | 'medium' | 'semiBold' | 'bold';
  align?: 'left' | 'center' | 'right';
  italic?: boolean;
  serif?: boolean;
}

export const AppText: React.FC<AppTextProps> = ({
  variant = 'body',
  color = Colors.text,
  weight,
  align = 'left',
  italic = false,
  serif = false,
  style,
  children,
  ...props
}) => {
  const variantStyle = (Typography as any)[variant] || Typography.body;

  let fontFamily: string = serif ? (Typography.fonts.serif || 'serif') : variantStyle.fontFamily;
  if (!serif) {
    if (weight === 'bold') fontFamily = Typography.fonts.bold;
    else if (weight === 'semiBold') fontFamily = Typography.fonts.semiBold;
    else if (weight === 'medium') fontFamily = Typography.fonts.medium;
    else if (weight === 'regular') fontFamily = Typography.fonts.regular;
  }

  const customStyle: TextStyle = {
    ...variantStyle,
    color,
    fontFamily,
    textAlign: align,
    fontStyle: italic ? 'italic' : 'normal',
  };

  return (
    <Text style={[customStyle, style]} {...props}>
      {children}
    </Text>
  );
};

export default AppText;
