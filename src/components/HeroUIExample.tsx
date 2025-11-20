import { Button, Card, CardBody, CardHeader } from '@heroui/react';

export default function HeroUIExample() {
  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <Card>
        <CardHeader>
          <h2 style={{ margin: 0 }}>HeroUI Example</h2>
        </CardHeader>
        <CardBody>
          <p>This is a test component to verify HeroUI is working correctly with Astro.</p>
          <div className='flex gap-4 bg-red-500'>
            <Button color="primary">Primary Button</Button>
            <Button color="secondary">Secondary Button</Button>
            <Button color="success">Bordered Button</Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

