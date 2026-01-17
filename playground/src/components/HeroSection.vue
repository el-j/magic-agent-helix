<template>
  <div class="hero-section">
    <div class="hero-gradient"></div>
    <div class="hero-content">
      <div class="hero-badge">
        <i class="pi pi-sparkles"></i>
        <span>AI-Powered Development Assistant</span>
      </div>
      
      <h1 class="hero-title">
        <span class="gradient-text">MagicAgentHelix</span>
        <br />
        <span class="hero-subtitle">Supercharge Your AI Coding Assistants</span>
      </h1>
      
      <p class="hero-description">
        Automatically generate context-aware instruction files for GitHub Copilot, 
        Cursor, and other AI assistants. Support for <strong>18 programming languages</strong> 
        with framework-specific best practices.
      </p>
      
      <div class="hero-stats">
        <div class="stat">
          <div class="stat-number">18</div>
          <div class="stat-label">Languages</div>
        </div>
        <div class="stat">
          <div class="stat-number">50+</div>
          <div class="stat-label">Frameworks</div>
        </div>
        <div class="stat">
          <div class="stat-number">100%</div>
          <div class="stat-label">Auto-Detected</div>
        </div>
      </div>
      
      <div class="hero-cta">
        <Button
          label="Try Live Demo"
          icon="pi pi-play"
          size="large"
          class="cta-primary"
          @click="scrollToDemo"
        />
        <Button
          label="Download VS Code Extension"
          icon="pi pi-download"
          size="large"
          severity="secondary"
          outlined
          class="cta-secondary"
          @click="scrollToDownload"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const scrollToDemo = () => {
  document.getElementById('live-demo')?.scrollIntoView({ behavior: 'smooth' });
};

const scrollToDownload = () => {
  document.getElementById('download')?.scrollIntoView({ behavior: 'smooth' });
};
</script>

<style scoped>
.hero-section {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  padding: 4rem 2rem;
}

.hero-gradient {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at top, rgba(59, 130, 246, 0.15), transparent 50%),
              radial-gradient(ellipse at bottom, rgba(16, 185, 129, 0.15), transparent 50%);
  pointer-events: none;
}

.hero-content {
  position: relative;
  max-width: 1200px;
  text-align: center;
  z-index: 1;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1.5rem;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 9999px;
  color: rgb(96, 165, 250);
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 2rem;
  backdrop-filter: blur(8px);
}

.hero-title {
  font-size: clamp(2.5rem, 8vw, 5rem);
  font-weight: 800;
  line-height: 1.1;
  margin-bottom: 1.5rem;
  letter-spacing: -0.02em;
}

.gradient-text {
  background: linear-gradient(135deg, #60a5fa 0%, #34d399 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  color: rgb(156, 163, 175);
  font-size: clamp(1.5rem, 4vw, 2.5rem);
  font-weight: 600;
}

.hero-description {
  font-size: clamp(1rem, 2vw, 1.25rem);
  color: rgb(209, 213, 219);
  max-width: 48rem;
  margin: 0 auto 3rem;
  line-height: 1.8;
}

.hero-stats {
  display: flex;
  justify-content: center;
  gap: 3rem;
  margin-bottom: 3rem;
  flex-wrap: wrap;
}

.stat {
  text-align: center;
}

.stat-number {
  font-size: 3rem;
  font-weight: 700;
  background: linear-gradient(135deg, #60a5fa 0%, #34d399 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
  margin-bottom: 0.5rem;
}

.stat-label {
  color: rgb(156, 163, 175);
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 500;
}

.hero-cta {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.cta-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #10b981 100%) !important;
  border: none !important;
  padding: 1rem 2rem !important;
  font-size: 1.125rem !important;
  font-weight: 600 !important;
  box-shadow: 0 10px 30px -10px rgba(59, 130, 246, 0.5);
  transition: all 0.3s ease;
}

.cta-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 40px -10px rgba(59, 130, 246, 0.6);
}

.cta-secondary {
  border-color: rgb(75, 85, 99) !important;
  color: rgb(209, 213, 219) !important;
  padding: 1rem 2rem !important;
  font-size: 1.125rem !important;
  font-weight: 600 !important;
  transition: all 0.3s ease;
}

.cta-secondary:hover {
  border-color: rgb(96, 165, 250) !important;
  color: rgb(96, 165, 250) !important;
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .hero-stats {
    gap: 2rem;
  }
  
  .hero-cta {
    flex-direction: column;
    align-items: center;
  }
  
  .cta-primary,
  .cta-secondary {
    width: 100%;
    max-width: 300px;
  }
}
</style>
