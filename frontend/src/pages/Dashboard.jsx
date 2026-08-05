import React from 'react';
import { Container, Row, Col, Table } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FaImages, FaVideo, FaCamera, FaChartPie } from 'react-icons/fa';
import { dashboardStats, poseDistribution, performanceData, recentActivity } from '../utils/dummyData';
import PageHeader from '../components/ui/PageHeader';
import AnimatedCounter from '../components/ui/AnimatedCounter';

const COLORS = ['#FF9933', '#2563EB', '#FFD700', '#22C55E'];

const tooltipStyle = {
  backgroundColor: '#162032',
  borderColor: 'rgba(255,255,255,0.08)',
  color: '#FFFFFF',
  fontSize: 13,
  borderRadius: 12,
};

const statCards = [
  { icon: FaImages, label: 'Images Processed', value: dashboardStats.imagesProcessed, suffix: '', color: 'var(--primary)' },
  { icon: FaVideo, label: 'Videos Analyzed', value: dashboardStats.videosProcessed, suffix: '', color: 'var(--secondary-light)' },
  { icon: FaCamera, label: 'Live Sessions', value: dashboardStats.liveSessions, suffix: '', color: 'var(--accent)' },
  { icon: FaChartPie, label: 'Avg Accuracy', value: dashboardStats.avgAccuracy, suffix: '%', color: 'var(--success)' },
];

const Dashboard = () => {
  return (
    <div className="page-wrapper pt-0 mt-0">
      <Container className="position-relative">
        <PageHeader
          label="PERFORMANCE METRICS"
          title="Analytics"
          highlight="Dashboard"
          subtitle="Overview of system performance, detection statistics, and recent activity."
        />

        <Row className="g-3 g-lg-4 mb-4">
          {statCards.map((stat, idx) => (
            <Col md={3} sm={6} key={idx}>
              <div className="glass-card p-4 text-center h-100">
                <div
                  className="feature-icon feature-icon-lg mx-auto mb-3"
                  style={{ color: stat.color, borderColor: `${stat.color}33`, background: `${stat.color}15` }}
                >
                  <stat.icon />
                </div>
                <AnimatedCounter end={stat.value} suffix={stat.suffix} label={stat.label} className="p-0" />
              </div>
            </Col>
          ))}
        </Row>

        <Row className="g-3 g-lg-4 mb-4">
          <Col lg={8}>
            <div className="glass-card p-4 h-100">
              <h5 className="font-display mb-3 gradient-text">Weekly Accuracy Trend</h5>
              <div style={{ height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="name" stroke="#9CA3AF" tick={{ fontSize: 12 }} />
                    <YAxis stroke="#9CA3AF" domain={[0, 100]} tick={{ fontSize: 12 }} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend wrapperStyle={{ fontSize: 13 }} />
                    <Line
                      type="monotone"
                      dataKey="accuracy"
                      stroke="#FF9933"
                      strokeWidth={2.5}
                      dot={{ r: 5, fill: '#FF9933', stroke: '#FFD700', strokeWidth: 2 }}
                      activeDot={{ r: 7 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Col>
          <Col lg={4}>
            <div className="glass-card p-4 h-100">
              <h5 className="font-display mb-3 gradient-text">Pose Distribution</h5>
              <div style={{ height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={poseDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {poseDistribution.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Col>
        </Row>

        <div className="glass-card p-4 mb-4">
          <h5 className="font-display mb-3 gradient-text">Recent Activity</h5>
          <div className="table-responsive">
            <Table hover className="mb-0 table-dark">
              <thead>
                <tr>
                  {['ID', 'Type', 'Pose', 'Accuracy', 'Date', 'Status'].map((h) => (
                    <th key={h} style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-muted)', borderColor: 'var(--border)', letterSpacing: '0.05em' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentActivity.map((activity) => (
                  <tr key={activity.id}>
                    <td style={{ fontSize: '0.85rem', borderColor: 'var(--border)' }}>#{activity.id}</td>
                    <td style={{ borderColor: 'var(--border)' }}>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          padding: '0.2rem 0.65rem',
                          borderRadius: 50,
                          background: activity.type === 'Live' ? 'rgba(255,153,51,0.12)' : 'rgba(37,99,235,0.12)',
                          color: activity.type === 'Live' ? 'var(--primary)' : 'var(--secondary-light)',
                        }}
                      >
                        {activity.type}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.85rem', borderColor: 'var(--border)' }}>{activity.pose}</td>
                    <td style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)', borderColor: 'var(--border)' }}>
                      {activity.accuracy}
                    </td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)', borderColor: 'var(--border)' }}>
                      {activity.date}
                    </td>
                    <td style={{ borderColor: 'var(--border)' }}>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          padding: '0.2rem 0.65rem',
                          borderRadius: 50,
                          background: activity.status === 'Completed' ? 'rgba(34,197,94,0.12)' : 'rgba(255,215,0,0.12)',
                          color: activity.status === 'Completed' ? 'var(--success)' : 'var(--accent)',
                        }}
                      >
                        {activity.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default Dashboard;
