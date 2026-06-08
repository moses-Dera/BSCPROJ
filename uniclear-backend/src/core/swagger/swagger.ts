import swaggerJsdoc from 'swagger-jsdoc'

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'UniClear API',
      version: '1.0.0',
      description: 'Multi-Tenant University Clearance Platform — REST API',
    },
    servers: [{ url: '/api/v1', description: 'API v1' }],
    components: {
      securitySchemes: {
        BearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error:   { type: 'string' },
            details: { type: 'object' },
          },
        },
        University: {
          type: 'object',
          properties: {
            id: { type: 'string' }, name: { type: 'string' }, slug: { type: 'string' },
            abbreviation: { type: 'string' }, primaryColor: { type: 'string' },
            accentColor: { type: 'string' }, address: { type: 'string' },
            contactEmail: { type: 'string' }, isActive: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Student: {
          type: 'object',
          properties: {
            id: { type: 'string' }, universityId: { type: 'string' },
            matricNo: { type: 'string' }, firstName: { type: 'string' },
            lastName: { type: 'string' }, level: { type: 'string' },
            phone: { type: 'string' }, createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Officer: {
          type: 'object',
          properties: {
            id: { type: 'string' }, universityId: { type: 'string' },
            stageId: { type: 'string', nullable: true },
            firstName: { type: 'string' }, lastName: { type: 'string' },
          },
        },
        Stage: {
          type: 'object',
          properties: {
            id: { type: 'string' }, name: { type: 'string' },
            description: { type: 'string', nullable: true },
            orderIndex: { type: 'integer' }, isActive: { type: 'boolean' },
          },
        },
        DocumentType: {
          type: 'object',
          properties: {
            id: { type: 'string' }, name: { type: 'string' },
            description: { type: 'string', nullable: true },
            isRequired: { type: 'boolean' },
            allowedFormats: { type: 'array', items: { type: 'string' } },
            maxFileSizeMB: { type: 'integer' }, isActive: { type: 'boolean' },
          },
        },
        Document: {
          type: 'object',
          properties: {
            id: { type: 'string' }, studentId: { type: 'string' },
            requestId: { type: 'string' }, documentTypeId: { type: 'string' },
            fileName: { type: 'string' }, fileUrl: { type: 'string' },
            fileSizeMB: { type: 'number' }, uploadedAt: { type: 'string', format: 'date-time' },
          },
        },
        ClearanceRequest: {
          type: 'object',
          properties: {
            id: { type: 'string' }, studentId: { type: 'string' },
            sessionId: { type: 'string' }, currentStageId: { type: 'string', nullable: true },
            status: { type: 'string', enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'REJECTED'] },
            completedAt: { type: 'string', format: 'date-time', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Notification: {
          type: 'object',
          properties: {
            id: { type: 'string' }, userId: { type: 'string' },
            type: { type: 'string' }, title: { type: 'string' },
            message: { type: 'string' }, isRead: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        AcademicSession: {
          type: 'object',
          properties: {
            id: { type: 'string' }, name: { type: 'string' },
            startDate: { type: 'string', format: 'date-time' },
            endDate: { type: 'string', format: 'date-time' },
            isActive: { type: 'boolean' },
          },
        },
        AuditLog: {
          type: 'object',
          properties: {
            id: { type: 'string' }, actorId: { type: 'string' },
            action: { type: 'string' }, targetId: { type: 'string', nullable: true },
            targetType: { type: 'string', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
    security: [{ BearerAuth: [] }],
    tags: [
      { name: 'Auth',           description: 'Authentication & session management' },
      { name: 'Universities',   description: 'Platform Owner — university management' },
      { name: 'Students',       description: 'Student management' },
      { name: 'Officers',       description: 'Officer management' },
      { name: 'Stages',         description: 'Clearance stage configuration' },
      { name: 'Document Types', description: 'Document type catalogue' },
      { name: 'Documents',      description: 'Student file uploads' },
      { name: 'Clearance',      description: 'Clearance workflow engine' },
      { name: 'Notifications',  description: 'In-app notifications' },
      { name: 'Sessions',       description: 'Academic session management' },
      { name: 'Branding',       description: 'University branding' },
      { name: 'Reports',        description: 'Analytics and reporting' },
      { name: 'Audit',          description: 'Immutable audit logs' },
    ],
    paths: {
      // AUTH
      '/auth/login': {
        post: {
          tags: ['Auth'], summary: 'Login', security: [],
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['email', 'password'], properties: { email: { type: 'string', format: 'email' }, password: { type: 'string' } } } } } },
          responses: { 200: { description: 'Login successful' }, 401: { description: 'Invalid credentials' } },
        },
      },
      '/auth/refresh': {
        post: {
          tags: ['Auth'], summary: 'Refresh access token', security: [],
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { refreshToken: { type: 'string' } } } } } },
          responses: { 200: { description: 'New access token' }, 401: { description: 'Invalid refresh token' } },
        },
      },
      '/auth/logout': {
        post: {
          tags: ['Auth'], summary: 'Logout',
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { refreshToken: { type: 'string' } } } } } },
          responses: { 204: { description: 'Logged out' } },
        },
      },
      '/auth/me': {
        get: { tags: ['Auth'], summary: 'Get current user', responses: { 200: { description: 'Current user' } } },
      },
      '/auth/set-password': {
        post: {
          tags: ['Auth'], summary: 'Set password (first login)',
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { password: { type: 'string' }, confirmPassword: { type: 'string' } } } } } },
          responses: { 200: { description: 'Password set' } },
        },
      },
      '/auth/change-password': {
        patch: {
          tags: ['Auth'], summary: 'Change password',
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { currentPassword: { type: 'string' }, newPassword: { type: 'string' }, confirmPassword: { type: 'string' } } } } } },
          responses: { 200: { description: 'Password changed' } },
        },
      },

      // UNIVERSITIES
      '/universities': {
        get:  { tags: ['Universities'], summary: 'List all universities', parameters: [{ name: 'page', in: 'query', schema: { type: 'integer', default: 1 } }, { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } }, { name: 'search', in: 'query', schema: { type: 'string' } }], responses: { 200: { description: 'Paginated list' } } },
        post: { tags: ['Universities'], summary: 'Create university', requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/University' } } } }, responses: { 201: { description: 'Created' } } },
      },
      '/universities/{id}': {
        get:    { tags: ['Universities'], summary: 'Get university',    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'University' } } },
        patch:  { tags: ['Universities'], summary: 'Update university', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Updated' } } },
        delete: { tags: ['Universities'], summary: 'Delete university', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 204: { description: 'Deleted' } } },
      },
      '/universities/{id}/suspend':  { patch: { tags: ['Universities'], summary: 'Suspend university', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Suspended' } } } },
      '/universities/{id}/restore':  { patch: { tags: ['Universities'], summary: 'Restore university', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Restored' } } } },
      '/universities/{id}/contract': { patch: { tags: ['Universities'], summary: 'Update contract/tier', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { tier: { type: 'string', enum: ['TRIAL', 'STANDARD', 'ENTERPRISE'] }, contractRef: { type: 'string' }, expiresAt: { type: 'string', format: 'date-time' } } } } } }, responses: { 200: { description: 'Updated' } } } },

      // STUDENTS
      '/students': {
        get:  { tags: ['Students'], summary: 'List students', parameters: [{ name: 'page', in: 'query', schema: { type: 'integer' } }, { name: 'limit', in: 'query', schema: { type: 'integer' } }, { name: 'search', in: 'query', schema: { type: 'string' } }], responses: { 200: { description: 'Paginated list' } } },
        post: { tags: ['Students'], summary: 'Invite student', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['email', 'matricNo', 'firstName', 'lastName'], properties: { email: { type: 'string' }, matricNo: { type: 'string' }, firstName: { type: 'string' }, lastName: { type: 'string' }, level: { type: 'string' }, phone: { type: 'string' } } } } } }, responses: { 201: { description: 'Created' } } },
      },
      '/students/{id}': {
        get:    { tags: ['Students'], summary: 'Get student',    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Student' } } },
        patch:  { tags: ['Students'], summary: 'Update student', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Updated' } } },
        delete: { tags: ['Students'], summary: 'Delete student', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 204: { description: 'Deleted' } } },
      },
      '/students/{id}/clearance': {
        get: { tags: ['Students'], summary: 'Get student clearance progress', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Progress' } } },
      },

      // OFFICERS
      '/officers': {
        get:  { tags: ['Officers'], summary: 'List officers', parameters: [{ name: 'page', in: 'query', schema: { type: 'integer' } }, { name: 'stageId', in: 'query', schema: { type: 'string' } }], responses: { 200: { description: 'Paginated list' } } },
        post: { tags: ['Officers'], summary: 'Invite officer', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['email', 'firstName', 'lastName'], properties: { email: { type: 'string' }, firstName: { type: 'string' }, lastName: { type: 'string' }, stageId: { type: 'string' } } } } } }, responses: { 201: { description: 'Created' } } },
      },
      '/officers/{id}': {
        get:    { tags: ['Officers'], summary: 'Get officer',    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Officer' } } },
        patch:  { tags: ['Officers'], summary: 'Update officer', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Updated' } } },
        delete: { tags: ['Officers'], summary: 'Delete officer', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 204: { description: 'Deleted' } } },
      },

      // STAGES
      '/stages': {
        get:  { tags: ['Stages'], summary: 'List stages', responses: { 200: { description: 'Stages ordered by orderIndex' } } },
        post: { tags: ['Stages'], summary: 'Create stage', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['name', 'orderIndex'], properties: { name: { type: 'string' }, description: { type: 'string' }, orderIndex: { type: 'integer' }, officerId: { type: 'string' } } } } } }, responses: { 201: { description: 'Created' } } },
      },
      '/stages/reorder': {
        patch: { tags: ['Stages'], summary: 'Reorder stages', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { stages: { type: 'array', items: { type: 'object', properties: { id: { type: 'string' }, orderIndex: { type: 'integer' } } } } } } } } }, responses: { 200: { description: 'Reordered' } } },
      },
      '/stages/{id}': {
        get:    { tags: ['Stages'], summary: 'Get stage',    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Stage' } } },
        patch:  { tags: ['Stages'], summary: 'Update stage', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Updated' } } },
        delete: { tags: ['Stages'], summary: 'Delete stage', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 204: { description: 'Deleted' } } },
      },
      '/stages/{id}/toggle': {
        patch: { tags: ['Stages'], summary: 'Toggle active/inactive', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Toggled' } } },
      },

      // DOCUMENT TYPES
      '/document-types': {
        get:  { tags: ['Document Types'], summary: 'List document types', responses: { 200: { description: 'All document types' } } },
        post: { tags: ['Document Types'], summary: 'Create document type', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['name'], properties: { name: { type: 'string' }, description: { type: 'string' }, isRequired: { type: 'boolean' }, allowedFormats: { type: 'array', items: { type: 'string' } }, maxFileSizeMB: { type: 'integer' }, stageId: { type: 'string' } } } } } }, responses: { 201: { description: 'Created' } } },
      },
      '/document-types/{id}': {
        get:    { tags: ['Document Types'], summary: 'Get document type',    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Document type' } } },
        patch:  { tags: ['Document Types'], summary: 'Update document type', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Updated' } } },
        delete: { tags: ['Document Types'], summary: 'Delete document type', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 204: { description: 'Deleted' } } },
      },
      '/document-types/{id}/toggle': {
        patch: { tags: ['Document Types'], summary: 'Toggle active/inactive', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Toggled' } } },
      },
      '/document-types/{id}/assign-stage': {
        post: { tags: ['Document Types'], summary: 'Assign to a stage', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { stageId: { type: 'string' }, isRequired: { type: 'boolean' } } } } } }, responses: { 200: { description: 'Assigned' } } },
      },
      '/document-types/{id}/assign-stage/{stageId}': {
        delete: { tags: ['Document Types'], summary: 'Remove from stage', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }, { name: 'stageId', in: 'path', required: true, schema: { type: 'string' } }], responses: { 204: { description: 'Removed' } } },
      },

      // DOCUMENTS
      '/documents/request/{requestId}': {
        get: { tags: ['Documents'], summary: 'Get documents for a clearance request', parameters: [{ name: 'requestId', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Documents' } } },
      },
      '/documents/request/{requestId}/stage/{stageId}': {
        get: { tags: ['Documents'], summary: 'Get documents for a specific stage', parameters: [{ name: 'requestId', in: 'path', required: true, schema: { type: 'string' } }, { name: 'stageId', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Stage documents' } } },
      },
      '/documents/upload': {
        post: { tags: ['Documents'], summary: 'Upload a document', requestBody: { required: true, content: { 'multipart/form-data': { schema: { type: 'object', required: ['file', 'requestId', 'documentTypeId'], properties: { file: { type: 'string', format: 'binary' }, requestId: { type: 'string' }, documentTypeId: { type: 'string' } } } } } }, responses: { 201: { description: 'Uploaded' } } },
      },
      '/documents/{id}/url': {
        get: { tags: ['Documents'], summary: 'Get signed/view URL', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'URL' } } },
      },
      '/documents/{id}': {
        delete: { tags: ['Documents'], summary: 'Delete document', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 204: { description: 'Deleted' } } },
      },

      // CLEARANCE
      '/clearance/start': {
        post: { tags: ['Clearance'], summary: 'Start clearance', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['sessionId'], properties: { sessionId: { type: 'string' } } } } } }, responses: { 201: { description: 'Started' } } },
      },
      '/clearance/status': {
        get: { tags: ['Clearance'], summary: 'Get my clearance status', responses: { 200: { description: 'Clearance status' } } },
      },
      '/clearance/queue': {
        get: { tags: ['Clearance'], summary: 'Officer pending queue', parameters: [{ name: 'page', in: 'query', schema: { type: 'integer' } }, { name: 'search', in: 'query', schema: { type: 'string' } }], responses: { 200: { description: 'Pending queue' } } },
      },
      '/clearance/{requestId}/submit': {
        post: { tags: ['Clearance'], summary: 'Submit stage for review', parameters: [{ name: 'requestId', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Submitted' } } },
      },
      '/clearance/{requestId}/approve': {
        post: { tags: ['Clearance'], summary: 'Approve a stage', parameters: [{ name: 'requestId', in: 'path', required: true, schema: { type: 'string' } }], requestBody: { required: false, content: { 'application/json': { schema: { type: 'object', properties: { remarks: { type: 'string' } } } } } }, responses: { 200: { description: 'Approved' } } },
      },
      '/clearance/{requestId}/reject': {
        post: { tags: ['Clearance'], summary: 'Reject a stage', parameters: [{ name: 'requestId', in: 'path', required: true, schema: { type: 'string' } }], requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['remarks'], properties: { remarks: { type: 'string', minLength: 10 } } } } } }, responses: { 200: { description: 'Rejected' } } },
      },
      '/clearance/{requestId}/history': {
        get: { tags: ['Clearance'], summary: 'Get clearance history', parameters: [{ name: 'requestId', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'History' } } },
      },
      '/clearance/{requestId}/certificate': {
        get: { tags: ['Clearance'], summary: 'Get clearance certificate data', parameters: [{ name: 'requestId', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Certificate data' } } },
      },

      // NOTIFICATIONS
      '/notifications': {
        get: { tags: ['Notifications'], summary: 'List notifications', parameters: [{ name: 'page', in: 'query', schema: { type: 'integer' } }, { name: 'limit', in: 'query', schema: { type: 'integer' } }], responses: { 200: { description: 'Paginated notifications' } } },
      },
      '/notifications/unread-count': {
        get: { tags: ['Notifications'], summary: 'Get unread count', responses: { 200: { description: 'Count' } } },
      },
      '/notifications/read-all': {
        patch: { tags: ['Notifications'], summary: 'Mark all as read', responses: { 204: { description: 'Done' } } },
      },
      '/notifications/{id}/read': {
        patch: { tags: ['Notifications'], summary: 'Mark one as read', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 204: { description: 'Done' } } },
      },
      '/notifications/{id}': {
        delete: { tags: ['Notifications'], summary: 'Delete notification', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 204: { description: 'Deleted' } } },
      },

      // SESSIONS
      '/sessions': {
        get:  { tags: ['Sessions'], summary: 'List academic sessions', responses: { 200: { description: 'Sessions' } } },
        post: { tags: ['Sessions'], summary: 'Create session', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['name', 'startDate', 'endDate'], properties: { name: { type: 'string' }, startDate: { type: 'string', format: 'date-time' }, endDate: { type: 'string', format: 'date-time' } } } } } }, responses: { 201: { description: 'Created' } } },
      },
      '/sessions/{id}': {
        get:    { tags: ['Sessions'], summary: 'Get session',    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Session' } } },
        patch:  { tags: ['Sessions'], summary: 'Update session', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Updated' } } },
        delete: { tags: ['Sessions'], summary: 'Delete session', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 204: { description: 'Deleted' } } },
      },
      '/sessions/{id}/activate': {
        patch: { tags: ['Sessions'], summary: 'Set as active session', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Activated' } } },
      },

      // BRANDING
      '/branding': {
        get:   { tags: ['Branding'], summary: 'Get branding config', responses: { 200: { description: 'Branding' } } },
        patch: { tags: ['Branding'], summary: 'Update branding', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { bannerMessage: { type: 'string' }, footerText: { type: 'string' } } } } } }, responses: { 200: { description: 'Updated' } } },
      },
      '/branding/logo': {
        post: { tags: ['Branding'], summary: 'Upload logo', requestBody: { required: true, content: { 'multipart/form-data': { schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } } } }, responses: { 200: { description: 'Uploaded' } } },
      },
      '/branding/login-bg': {
        post: { tags: ['Branding'], summary: 'Upload login background', requestBody: { required: true, content: { 'multipart/form-data': { schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } } } }, responses: { 200: { description: 'Uploaded' } } },
      },

      // REPORTS
      '/reports/summary':  { get: { tags: ['Reports'], summary: 'Clearance summary stats',   responses: { 200: { description: 'Stats' } } } },
      '/reports/by-stage': { get: { tags: ['Reports'], summary: 'Per-stage breakdown',        responses: { 200: { description: 'Breakdown' } } } },
      '/reports/export':   { get: { tags: ['Reports'], summary: 'Export clearance data', parameters: [{ name: 'sessionId', in: 'query', schema: { type: 'string' } }], responses: { 200: { description: 'Data' } } } },

      // AUDIT
      '/audit': {
        get: { tags: ['Audit'], summary: 'Get audit logs', parameters: [{ name: 'page', in: 'query', schema: { type: 'integer' } }, { name: 'actorId', in: 'query', schema: { type: 'string' } }, { name: 'targetId', in: 'query', schema: { type: 'string' } }], responses: { 200: { description: 'Audit logs' } } },
      },
    },
  },
  apis: [],
}

export const swaggerSpec = swaggerJsdoc(options)
