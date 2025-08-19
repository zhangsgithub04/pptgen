// Simple test script to debug feedback system
const testFeedback = async () => {
  const testSlides = [
    {
      title: "Test Slide 1",
      content: "- Original bullet point 1\n- Original bullet point 2\n- Original bullet point 3",
      imageUrl: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNCIgaGVpZ2h0PSIzIj48L3N2Zz4="
    },
    {
      title: "Test Slide 2", 
      content: "- Another bullet point\n- More content here\n- Last point",
      imageUrl: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNCIgaGVpZ2h0PSIzIj48L3N2Zz4="
    }
  ];

  try {
    console.log('🧪 Testing feedback API...');
    console.log('📊 Input slides:', testSlides);
    
    const response = await fetch('http://localhost:3002/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slides: testSlides,
        feedback: "Make all slides more technical and detailed",
        slideIndex: undefined, // Global feedback
        template: {
          name: "Modern Business",
          promptPrefix: "Create a modern business presentation about"
        }
      }),
    });

    console.log('📡 Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error response:', errorText);
      return;
    }

    const result = await response.json();
    console.log('✅ Success! Result:', result);
    console.log('📈 Updated slides count:', result.slides?.length);
    
    if (result.slides) {
      result.slides.forEach((slide, index) => {
        console.log(`\n📄 Slide ${index + 1}:`);
        console.log(`  Title: ${slide.title}`);
        console.log(`  Content: ${slide.content}`);
        if (slide.critique) {
          console.log(`  Critique: ${slide.critique}`);
        }
      });
    }
    
  } catch (error) {
    console.error('💥 Test failed:', error);
  }
};

testFeedback();
