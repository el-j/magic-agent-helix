<template>
  <div class="features-section">
    <div class="section-header">
      <span class="section-badge">Capabilities</span>
      <h2 class="section-title">Everything You Need for AI-Assisted Development</h2>
      <p class="section-description">
        MagicAgentHelix analyzes your codebase and generates precise, context-aware instructions 
        that make your AI coding assistants exponentially more effective.
      </p>
    </div>

    <div class="features-grid">
      <!-- Feature 1 -->
      <div class="feature-card">
        <div class="feature-icon" style="background: linear-gradient(135deg, #3b82f6, #1d4ed8);">
          <i class="pi pi-bolt"></i>
        </div>
        <h3>Automatic Detection</h3>
        <p>
          Instantly recognizes your project's languages, frameworks, and dependencies. 
          No configuration needed—just run and go.
        </p>
      </div>

      <!-- Feature 2 -->
      <div class="feature-card">
        <div class="feature-icon" style="background: linear-gradient(135deg, #10b981, #059669);">
          <i class="pi pi-code"></i>
        </div>
        <h3>18 Languages Supported</h3>
        <p>
          TypeScript, Python, Go, Rust, Java, Ruby, PHP, C#, C++, Swift, Elixir, 
          Dart/Flutter, Scala, Kotlin, Lua, R, Perl, Shell.
        </p>
      </div>

      <!-- Feature 3 -->
      <div class="feature-card">
        <div class="feature-icon" style="background: linear-gradient(135deg, #8b5cf6, #6366f1);">
          <i class="pi pi-palette"></i>
        </div>
        <h3>Framework Intelligence</h3>
        <p>
          Detects React, Vue, Angular, Next.js, Django, Flask, Phoenix, Spring Boot, 
          and 40+ more frameworks with specific best practices.
        </p>
      </div>

      <!-- Feature 4 -->
      <div class="feature-card">
        <div class="feature-icon" style="background: linear-gradient(135deg, #f59e0b, #d97706);">
          <i class="pi pi-file-edit"></i>
        </div>
        <h3>Custom Templates</h3>
        <p>
          Each language and framework gets tailored instruction templates with 
          patterns, conventions, and project-specific guidelines.
        </p>
      </div>

      <!-- Feature 5 -->
      <div class="feature-card">
        <div class="feature-icon" style="background: linear-gradient(135deg, #ec4899, #be185d);">
          <i class="pi pi-sync"></i>
        </div>
        <h3>Always Up-to-Date</h3>
        <p>
          Refresh command keeps your AI instructions synchronized as your 
          project evolves and dependencies change.
        </p>
      </div>

      <!-- Feature 6 -->
      <div class="feature-card">
        <div class="feature-icon" style="background: linear-gradient(135deg, #06b6d4, #0891b2);">
          <i class="pi pi-box"></i>
        </div>
        <h3>VS Code Integration</h3>
        <p>
          One-click command palette integration. Run directly from your editor 
          with progress tracking and status updates.
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.features-section {
  padding: 8rem 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.section-header {
  text-align: center;
  margin-bottom: 4rem;
}

.section-badge {
  display: inline-block;
  padding: 0.5rem 1rem;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 9999px;
  color: rgb(96, 165, 250);
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 1rem;
}

.section-title {
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: 800;
  color: white;
  margin-bottom: 1.5rem;
  line-height: 1.2;
}

.section-description {
  font-size: 1.25rem;
  color: rgb(156, 163, 175);
  max-width: 48rem;
  margin: 0 auto;
  line-height: 1.8;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 2rem;
}

.feature-card {
  background: rgba(31, 41, 55, 0.5);
  border: 1px solid rgb(55, 65, 81);
  border-radius: 1rem;
  padding: 2rem;
  transition: all 0.3s ease;
  backdrop-filter: blur(8px);
}

.feature-card:hover {
  transform: translateY(-4px);
  border-color: rgb(75, 85, 99);
  box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.3);
}

.feature-icon {
  width: 4rem;
  height: 4rem;
  border-radius: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: white;
  margin-bottom: 1.5rem;
}

.feature-card h3 {
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  margin-bottom: 1rem;
}

.feature-card p {
  color: rgb(156, 163, 175);
  line-height: 1.7;
  font-size: 1rem;
}

@media (max-width: 768px) {
  .features-section {
    padding: 4rem 1rem;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
  }
}
</style>
