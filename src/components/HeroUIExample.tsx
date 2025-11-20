import { Button, Card, CardBody, CardHeader } from '@heroui/react';

export default function HeroUIExample() {
  return (
    <div className="p-8 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <h2 className="m-0">HeroUI Example</h2>
        </CardHeader>
        <CardBody>
          <p>This is a test component to verify HeroUI is working correctly with Astro.</p>
          <div className="flex gap-4">
            <Button color="primary">Primary Button</Button>
            <Button color="secondary">Secondary Button</Button>
            <Button color="primary" variant="bordered">Bordered Button</Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

