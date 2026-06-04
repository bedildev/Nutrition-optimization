import React from 'react';
import Button from './ui/Button';
import Badge from './ui/Badge';
import Card, { CardAction, CardHeader, CardDescription, CardFooter, CardTitle } from './ui/Card';

export default function CardImage({ title, description, badge = null, image, buttonText = 'View', to }) {
  return (
    <Card className="relative mx-auto w-full max-w-sm pt-0 overflow-hidden">
      <div className="absolute inset-0 z-30 aspect-video bg-black/35" />
      {image && (
        <img
          src={image}
          alt={title}
          className="card-root__img relative z-20 w-full object-cover brightness-60 grayscale dark:brightness-40"
        />
      )}
      <CardHeader>
        {badge && (
          <CardAction>
            <Badge variant="secondary">{badge}</Badge>
          </CardAction>
        )}
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardFooter>
        {buttonText ? <Button className="w-full" to={to}>{buttonText}</Button> : null}
      </CardFooter>
    </Card>
  );
}
