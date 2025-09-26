/**
 * Database query optimizer
 * Provides query optimization and performance monitoring
 */

import { logger } from './logger';

export interface QueryMetrics {
  query: string;
  duration: number;
  timestamp: Date;
  success: boolean;
  error?: string;
  parameters?: any[];
  executionPlan?: string;
}

export interface OptimizationSuggestion {
  type: 'index' | 'query' | 'connection' | 'cache';
  severity: 'low' | 'medium' | 'high';
  description: string;
  suggestion: string;
  impact: string;
}

export interface QueryPerformanceReport {
  totalQueries: number;
  averageDuration: number;
  slowQueries: number;
  errorRate: number;
  suggestions: OptimizationSuggestion[];
  topSlowQueries: Array<{
    query: string;
    duration: number;
    count: number;
  }>;
}

class QueryOptimizer {
  private queryHistory: QueryMetrics[] = [];
  private maxHistorySize: number = 1000;
  private slowQueryThreshold: number = 1000; // 1 second
  private performanceThresholds = {
    slow: 1000,
    verySlow: 5000,
    critical: 10000,
  };

  /**
   * Record a query execution
   */
  public recordQuery(
    query: string,
    duration: number,
    success: boolean,
    error?: string,
    parameters?: any[]
  ): void {
    const metric: QueryMetrics = {
      query: this.sanitizeQuery(query),
      duration,
      timestamp: new Date(),
      success,
      ...(error && { error }),
      ...(parameters && { parameters }),
    };

    this.queryHistory.push(metric);

    // Keep only recent queries
    if (this.queryHistory.length > this.maxHistorySize) {
      this.queryHistory.shift();
    }

    // Log slow queries
    if (duration > this.slowQueryThreshold) {
      logger.warn('Slow query detected:', {
        query: metric.query,
        duration,
        parameters,
      });
    }

    // Log critical queries
    if (duration > this.performanceThresholds.critical) {
      logger.error('Critical slow query detected:', {
        query: metric.query,
        duration,
        parameters,
      });
    }
  }

  /**
   * Analyze query performance and generate suggestions
   */
  public analyzePerformance(): QueryPerformanceReport {
    const recentQueries = this.getRecentQueries();
    const totalQueries = recentQueries.length;

    if (totalQueries === 0) {
      return {
        totalQueries: 0,
        averageDuration: 0,
        slowQueries: 0,
        errorRate: 0,
        suggestions: [],
        topSlowQueries: [],
      };
    }

    const successfulQueries = recentQueries.filter((q) => q.success);
    const slowQueries = recentQueries.filter(
      (q) => q.duration > this.slowQueryThreshold
    );
    const errors = recentQueries.filter((q) => !q.success);

    const averageDuration =
      successfulQueries.reduce((sum, q) => sum + q.duration, 0) /
      successfulQueries.length;
    const errorRate = (errors.length / totalQueries) * 100;

    // Group slow queries by query pattern
    const slowQueryGroups = this.groupQueriesByPattern(slowQueries);
    const topSlowQueries = Object.entries(slowQueryGroups)
      .map(([query, queries]) => ({
        query,
        duration:
          queries.reduce((sum, q) => sum + q.duration, 0) / queries.length,
        count: queries.length,
      }))
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 10);

    const suggestions = this.generateOptimizationSuggestions(
      recentQueries,
      slowQueryGroups
    );

    return {
      totalQueries,
      averageDuration,
      slowQueries: slowQueries.length,
      errorRate,
      suggestions,
      topSlowQueries,
    };
  }

  /**
   * Get optimization suggestions for specific queries
   */
  public getQuerySuggestions(query: string): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = [];
    const sanitizedQuery = this.sanitizeQuery(query);

    // Check for common optimization opportunities
    if (sanitizedQuery.includes('SELECT *')) {
      suggestions.push({
        type: 'query',
        severity: 'medium',
        description: 'Query uses SELECT *',
        suggestion: 'Specify only required columns to reduce data transfer',
        impact: 'Reduces network traffic and memory usage',
      });
    }

    if (
      sanitizedQuery.includes('ORDER BY') &&
      !sanitizedQuery.includes('LIMIT')
    ) {
      suggestions.push({
        type: 'query',
        severity: 'low',
        description: 'Query uses ORDER BY without LIMIT',
        suggestion: 'Consider adding LIMIT clause to reduce sorting overhead',
        impact: 'Reduces sorting time for large result sets',
      });
    }

    if (sanitizedQuery.includes('WHERE') && sanitizedQuery.includes('LIKE')) {
      suggestions.push({
        type: 'index',
        severity: 'medium',
        description: 'Query uses LIKE operator',
        suggestion:
          'Consider adding text search indexes or using full-text search',
        impact: 'Improves search performance',
      });
    }

    if (sanitizedQuery.includes('JOIN') && sanitizedQuery.includes('WHERE')) {
      suggestions.push({
        type: 'index',
        severity: 'high',
        description: 'Query uses JOIN with WHERE clause',
        suggestion:
          'Ensure foreign key columns and WHERE clause columns are indexed',
        impact: 'Significantly improves join performance',
      });
    }

    return suggestions;
  }

  /**
   * Get recent queries (last hour)
   */
  private getRecentQueries(): QueryMetrics[] {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    return this.queryHistory.filter((q) => q.timestamp > oneHourAgo);
  }

  /**
   * Group queries by pattern for analysis
   */
  private groupQueriesByPattern(
    queries: QueryMetrics[]
  ): Record<string, QueryMetrics[]> {
    const groups: Record<string, QueryMetrics[]> = {};

    queries.forEach((query) => {
      const pattern = this.getQueryPattern(query.query);
      if (!groups[pattern]) {
        groups[pattern] = [];
      }
      groups[pattern].push(query);
    });

    return groups;
  }

  /**
   * Get query pattern for grouping
   */
  private getQueryPattern(query: string): string {
    // Remove specific values and normalize the query
    return query
      .replace(/\d+/g, '?')
      .replace(/'[^']*'/g, '?')
      .replace(/"([^"]*)"/g, '?')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Generate optimization suggestions
   */
  private generateOptimizationSuggestions(
    queries: QueryMetrics[],
    slowQueryGroups: Record<string, QueryMetrics[]>
  ): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = [];

    // Check for high error rate
    const errorRate =
      (queries.filter((q) => !q.success).length / queries.length) * 100;
    if (errorRate > 10) {
      suggestions.push({
        type: 'connection',
        severity: 'high',
        description: `High error rate: ${errorRate.toFixed(1)}%`,
        suggestion: 'Check database connection stability and query syntax',
        impact: 'Reduces application errors and improves reliability',
      });
    }

    // Check for slow query patterns
    Object.entries(slowQueryGroups).forEach(([pattern, queries]) => {
      if (queries.length > 5) {
        suggestions.push({
          type: 'query',
          severity: 'medium',
          description: `Frequent slow query pattern: ${pattern}`,
          suggestion: 'Optimize this query pattern or add appropriate indexes',
          impact: 'Reduces average query time',
        });
      }
    });

    // Check for missing indexes
    const selectQueries = queries.filter((q) => q.query.includes('SELECT'));
    if (selectQueries.length > 0) {
      const avgSelectTime =
        selectQueries.reduce((sum, q) => sum + q.duration, 0) /
        selectQueries.length;
      if (avgSelectTime > 500) {
        suggestions.push({
          type: 'index',
          severity: 'medium',
          description: 'Slow SELECT queries detected',
          suggestion:
            'Review and add missing indexes on frequently queried columns',
          impact: 'Improves query performance',
        });
      }
    }

    return suggestions;
  }

  /**
   * Sanitize query for logging and analysis
   */
  private sanitizeQuery(query: string): string {
    return query.replace(/\s+/g, ' ').trim().substring(0, 200); // Limit length for storage
  }

  /**
   * Get query history for analysis
   */
  public getQueryHistory(limit: number = 100): QueryMetrics[] {
    return this.queryHistory.slice(-limit);
  }

  /**
   * Clear query history
   */
  public clearHistory(): void {
    this.queryHistory = [];
  }

  /**
   * Get performance statistics
   */
  public getPerformanceStats(): {
    totalQueries: number;
    averageDuration: number;
    slowQueries: number;
    errorRate: number;
    uptime: number;
  } {
    const totalQueries = this.queryHistory.length;
    const successfulQueries = this.queryHistory.filter((q) => q.success);
    const slowQueries = this.queryHistory.filter(
      (q) => q.duration > this.slowQueryThreshold
    );
    const errors = this.queryHistory.filter((q) => !q.success);

    return {
      totalQueries,
      averageDuration:
        successfulQueries.length > 0
          ? successfulQueries.reduce((sum, q) => sum + q.duration, 0) /
            successfulQueries.length
          : 0,
      slowQueries: slowQueries.length,
      errorRate: totalQueries > 0 ? (errors.length / totalQueries) * 100 : 0,
      uptime:
        this.queryHistory.length > 0
          ? Date.now() - (this.queryHistory[0]?.timestamp.getTime() || 0)
          : 0,
    };
  }
}

// Singleton instance
const queryOptimizer = new QueryOptimizer();

export { queryOptimizer };
export default queryOptimizer;
