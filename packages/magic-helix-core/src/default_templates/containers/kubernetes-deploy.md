# Kubernetes Deployment Guide

## Basic Deployment Structure

### Deployment Manifest
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: app-deployment
  labels:
    app: myapp
spec:
  replicas: 3
  selector:
    matchLabels:
      app: myapp
  template:
    metadata:
      labels:
        app: myapp
    spec:
      containers:
      - name: app
        image: myregistry/myapp:1.0.0
        ports:
        - containerPort: 8080
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 8080
          initialDelaySeconds: 10
          periodSeconds: 5
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: db-url
```

### Service Manifest
```yaml
apiVersion: v1
kind: Service
metadata:
  name: app-service
spec:
  selector:
    app: myapp
  ports:
  - protocol: TCP
    port: 80
    targetPort: 8080
  type: LoadBalancer
```

### ConfigMap
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  LOG_LEVEL: "info"
  API_TIMEOUT: "30s"
```

### Secret
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: app-secrets
type: Opaque
data:
  db-url: cG9zdGdyZXM6Ly9leGFtcGxl  # base64 encoded
```

## Ingress Configuration
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: app-ingress
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  ingressClassName: nginx
  tls:
  - hosts:
    - myapp.example.com
    secretName: app-tls
  rules:
  - host: myapp.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: app-service
            port:
              number: 80
```

## Horizontal Pod Autoscaler
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: app-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: app-deployment
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

## StatefulSet (for databases)
```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres
spec:
  serviceName: postgres
  replicas: 3
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
      - name: postgres
        image: postgres:16-alpine
        ports:
        - containerPort: 5432
        volumeMounts:
        - name: data
          mountPath: /var/lib/postgresql/data
  volumeClaimTemplates:
  - metadata:
      name: data
    spec:
      accessModes: ["ReadWriteOnce"]
      resources:
        requests:
          storage: 10Gi
```

## Best Practices
1. **Resource Limits**: Always set CPU/memory requests and limits
2. **Health Checks**: Implement liveness and readiness probes
3. **Rolling Updates**: Use `RollingUpdate` strategy with `maxSurge` and `maxUnavailable`
4. **Pod Disruption Budgets**: Ensure availability during node maintenance
5. **Network Policies**: Restrict pod-to-pod communication
6. **RBAC**: Use ServiceAccounts with minimal permissions
7. **Secrets Management**: Use external secret managers (Vault, AWS Secrets Manager)
8. **Monitoring**: Deploy Prometheus/Grafana stack
9. **Logging**: Use Fluentd/Fluent Bit for log aggregation
10. **GitOps**: Manage deployments with ArgoCD or Flux

## Common Commands
```bash
# Apply manifests
kubectl apply -f deployment.yaml

# Check status
kubectl get pods -l app=myapp
kubectl describe pod <pod-name>
kubectl logs <pod-name> -f

# Scale deployment
kubectl scale deployment app-deployment --replicas=5

# Update image
kubectl set image deployment/app-deployment app=myregistry/myapp:2.0.0

# Rollback
kubectl rollout undo deployment/app-deployment

# Port forwarding
kubectl port-forward svc/app-service 8080:80
```
