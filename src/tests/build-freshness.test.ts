import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

// Path to client dist directory
const distPath = path.resolve(__dirname, '../../client/dist');

describe('Build artifacts', () => {
  it('Client dist directory exists', () => {
    expect(fs.existsSync(distPath)).toBe(true);
  });

  it('index.html exists and contains proper references', () => {
    const indexPath = path.join(distPath, 'index.html');
    expect(fs.existsSync(indexPath)).toBe(true);
    
    const html = fs.readFileSync(indexPath, 'utf8');
    
    // Check for content-hashed CSS file reference
    expect(html).toMatch(/href="(assets\/[^"]+\.[a-f0-9]+\.css)"/i);
    
    // Check for content-hashed JS file reference
    expect(html).toMatch(/src="(assets\/[^"]+\.[a-f0-9]+\.js)"/i);
  });

  it('Assets directory contains hashed files', () => {
    const assetsPath = path.join(distPath, 'assets');
    expect(fs.existsSync(assetsPath)).toBe(true);
    
    const files = fs.readdirSync(assetsPath);
    expect(files.length).toBeGreaterThan(0);
    
    // Check CSS files for content hash
    const cssFiles = files.filter(file => file.endsWith('.css'));
    if (cssFiles.length > 0) {
      // CSS files should contain a hash in the filename
      expect(cssFiles[0]).toMatch(/\.[a-f0-9]+\.css$/i);
    }
    
    // Check JS files for content hash
    const jsFiles = files.filter(file => file.endsWith('.js'));
    expect(jsFiles.length).toBeGreaterThan(0);
    
    // JS files should contain a hash in the filename
    expect(jsFiles[0]).toMatch(/\.[a-f0-9]+\.js$/i);
  });

  it('manifest.json exists and contains proper entries', () => {
    const manifestPath = path.join(distPath, 'manifest.json');
    expect(fs.existsSync(manifestPath)).toBe(true);
    
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    expect(Object.keys(manifest).length).toBeGreaterThan(0);
    
    // Check a random entry from the manifest
    const firstKey = Object.keys(manifest)[0];
    const firstEntry = manifest[firstKey];
    
    // Entry should have a file path
    expect(firstEntry).toHaveProperty('file');
    
    // File path should include content hash
    expect(firstEntry.file).toMatch(/\.[a-f0-9]+\.(js|css)$/i);
  });
}); 