<template>
  <div class="download-section" id="download">
    <div class="download-gradient"></div>
    <div class="download-content">
      <div class="section-header">
        <span class="section-badge">Get Started</span>
        <h2 class="section-title">Download & Install</h2>
        <p class="section-description">
          Get MagicAgentHelix running in minutes. Choose your preferred installation method below.
        </p>
      </div>

      <div class="download-grid">
        <!-- VS Code Extension -->
        <div class="download-card featured">
          <div class="card-badge">Recommended</div>
          <div class="card-icon">
            <i class="pi pi-code"></i>
          </div>
          <h3>VS Code Extension</h3>
          <p>One-click installation directly in VS Code. Run from command palette with full UI integration.</p>
          
          <div class="version-info">
            <span class="version-label">Latest Version</span>
            <span class="version-number">4.0.0-beta.7</span>
          </div>

          <Button
            label="Download VSIX"
            icon="pi pi-download"
            size="large"
            class="download-button"
            @click="downloadVSIX"
          />

          <div class="install-steps">
            <div class="step">
              <span class="step-number">1</span>
              <span>Download the VSIX file</span>
            </div>
            <div class="step">
              <span class="step-number">2</span>
              <span>Open VS Code Extensions (Ctrl+Shift+X)</span>
            </div>
            <div class="step">
              <span class="step-number">3</span>
              <span>Click "..." → Install from VSIX</span>
            </div>
          </div>
        </div>

        <!-- NPM Package -->
        <div class="download-card">
          <div class="card-icon secondary">
            <i class="pi pi-box"></i>
          </div>
          <h3>NPM Package</h3>
          <p>Use via npx or install globally. Perfect for CI/CD pipelines and automation.</p>

          <div class="version-info">
            <span class="version-label">Package Name</span>
            <span class="version-number">@el-j/magic-agent-helix</span>
          </div>

          <div class="code-block">
            <code>npx @el-j/magic-agent-helix run</code>
            <Button
              icon="pi pi-copy"
              text
              class="copy-button"
              @click="copyToClipboard('npx @el-j/magic-agent-helix run')"
            />
          </div>

          <div class="code-block">
            <code>npm install -g @el-j/magic-agent-helix</code>
            <Button
              icon="pi pi-copy"
              text
              class="copy-button"
              @click="copyToClipboard('npm install -g @el-j/magic-agent-helix')"
            />
          </div>
        </div>

        <!-- GitHub -->
        <div class="download-card">
          <div class="card-icon tertiary">
            <i class="pi pi-github"></i>
          </div>
          <h3>Source Code</h3>
          <p>Browse the source, contribute, or build from scratch. Open source under MIT license.</p>

          <div class="version-info">
            <span class="version-label">Repository</span>
            <span class="version-number">el-j/magic-agent-helix</span>
          </div>

          <Button
            label="View on GitHub"
            icon="pi pi-external-link"
            size="large"
            severity="secondary"
            outlined
            class="github-button"
            @click="openGitHub"
          />

          <div class="stats">
            <div class="stat-item">
              <i class="pi pi-star"></i>
              <span>Star the project</span>
            </div>
            <div class="stat-item">
              <i class="pi pi-code-branch"></i>
              <span>Fork & contribute</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Start -->
      <div class="quick-start">
        <h3>Quick Start Guide</h3>
        <div class="quick-start-grid">
          <div class="quick-start-step">
            <div class="step-icon">1</div>
            <h4>Install</h4>
            <p>Download VSIX or use npx</p>
          </div>
          <div class="quick-start-step">
            <div class="step-icon">2</div>
            <h4>Open Project</h4>
            <p>Open any code project in VS Code</p>
          </div>
          <div class="quick-start-step">
            <div class="step-icon">3</div>
            <h4>Run Command</h4>
            <p>Run "MagicAgentHelix: Run" or use npx</p>
          </div>
          <div class="quick-start-step">
            <div class="step-icon">4</div>
            <h4>AI Ready</h4>
            <p>Instructions auto-generated in .github/instructions/</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useToast } from 'primevue/usetoast';

const toast = useToast();

const downloadVSIX = () => {
  window.open('https://github.com/el-j/magic-agent-helix/releases/latest/download/magic-helix-vscode-4.0.0-beta.7.vsix', '_blank');
};

const openGitHub = () => {
  window.open('https://github.com/el-j/magic-agent-helix', '_blank');
};

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    toast.add({
      severity: 'success',
      summary: 'Copied!',
      detail: 'Command copied to clipboard',
      life: 2000,
    });
  } catch (err) {
    toast.add({
      severity: 'error',
      summary: 'Failed',
      detail: 'Could not copy to clipboard',
      life: 2000,
    });
  }
};
</script>

<style scoped>
.download-section {
  position: relative;
  padding: 8rem 2rem;
  overflow: hidden;
}

.download-gradient {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at center, rgba(59, 130, 246, 0.1), transparent 70%);
  pointer-events: none;
}

.download-content {
  position: relative;
  max-width: 1400px;
  margin: 0 auto;
  z-index: 1;
}

.section-header {
  text-align: center;
  margin-bottom: 4rem;
}

.section-badge {
  display: inline-block;
  padding: 0.5rem 1rem;
  background: rgba(139, 92, 246, 0.1);
  border: 1px solid rgba(139, 92, 246, 0.2);
  border-radius: 9999px;
  color: rgb(167, 139, 250);
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
}

.section-description {
  font-size: 1.25rem;
  color: rgb(156, 163, 175);
  max-width: 48rem;
  margin: 0 auto;
}

.download-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
  margin-bottom: 4rem;
}

.download-card {
  position: relative;
  background: rgba(31, 41, 55, 0.6);
  border: 2px solid rgb(55, 65, 81);
  border-radius: 1.5rem;
  padding: 2.5rem;
  transition: all 0.3s ease;
  backdrop-filter: blur(8px);
}

.download-card.featured {
  border-color: rgb(59, 130, 246);
  box-shadow: 0 0 30px rgba(59, 130, 246, 0.2);
}

.download-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.3);
}

.card-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 700;
  color: white;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.card-icon {
  width: 4rem;
  height: 4rem;
  border-radius: 1rem;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: white;
  margin-bottom: 1.5rem;
}

.card-icon.secondary {
  background: linear-gradient(135deg, #10b981, #059669);
}

.card-icon.tertiary {
  background: linear-gradient(135deg, #8b5cf6, #6366f1);
}

.download-card h3 {
  font-size: 1.75rem;
  font-weight: 700;
  color: white;
  margin-bottom: 1rem;
}

.download-card p {
  color: rgb(156, 163, 175);
  line-height: 1.7;
  margin-bottom: 1.5rem;
}

.version-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 0.5rem;
  margin-bottom: 1.5rem;
}

.version-label {
  color: rgb(156, 163, 175);
  font-size: 0.875rem;
}

.version-number {
  color: white;
  font-weight: 600;
  font-family: 'Courier New', monospace;
}

.download-button {
  width: 100%;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8) !important;
  border: none !important;
  padding: 1rem !important;
  font-size: 1.125rem !important;
  font-weight: 600 !important;
  margin-bottom: 1.5rem;
}

.github-button {
  width: 100%;
  border-color: rgb(139, 92, 246) !important;
  color: rgb(167, 139, 250) !important;
  padding: 1rem !important;
  font-size: 1.125rem !important;
  font-weight: 600 !important;
  margin-bottom: 1.5rem;
}

.install-steps,
.stats {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.step,
.stat-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: rgb(209, 213, 219);
  font-size: 0.875rem;
}

.step-number {
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  background: rgba(59, 130, 246, 0.2);
  color: rgb(96, 165, 250);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.75rem;
  flex-shrink: 0;
}

.code-block {
  position: relative;
  display: flex;
  align-items: center;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgb(55, 65, 81);
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 0.75rem;
  font-family: 'Courier New', monospace;
}

.code-block code {
  flex: 1;
  color: rgb(209, 213, 219);
  font-size: 0.875rem;
}

.copy-button {
  color: rgb(156, 163, 175) !important;
}

.quick-start {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(16, 185, 129, 0.05));
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 1.5rem;
  padding: 3rem;
  text-align: center;
}

.quick-start h3 {
  font-size: 2rem;
  font-weight: 700;
  color: white;
  margin-bottom: 2rem;
}

.quick-start-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
}

.quick-start-step {
  text-align: center;
}

.step-icon {
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6, #10b981);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  margin-bottom: 1rem;
}

.quick-start-step h4 {
  font-size: 1.25rem;
  font-weight: 700;
  color: white;
  margin-bottom: 0.5rem;
}

.quick-start-step p {
  color: rgb(156, 163, 175);
  font-size: 0.875rem;
}

@media (max-width: 768px) {
  .download-section {
    padding: 4rem 1rem;
  }
  
  .download-grid {
    grid-template-columns: 1fr;
  }
  
  .quick-start {
    padding: 2rem 1rem;
  }
  
  .quick-start-grid {
    grid-template-columns: 1fr;
  }
}
</style>
