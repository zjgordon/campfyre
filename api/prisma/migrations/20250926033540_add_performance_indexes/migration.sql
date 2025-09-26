-- CreateIndex
CREATE INDEX "campaigns_status_idx" ON "campaigns"("status");

-- CreateIndex
CREATE INDEX "campaigns_visibility_idx" ON "campaigns"("visibility");

-- CreateIndex
CREATE INDEX "campaigns_ownerId_idx" ON "campaigns"("ownerId");

-- CreateIndex
CREATE INDEX "campaigns_gameSystemId_idx" ON "campaigns"("gameSystemId");

-- CreateIndex
CREATE INDEX "campaigns_createdAt_idx" ON "campaigns"("createdAt");

-- CreateIndex
CREATE INDEX "campaigns_status_visibility_idx" ON "campaigns"("status", "visibility");

-- CreateIndex
CREATE INDEX "characters_ownerId_idx" ON "characters"("ownerId");

-- CreateIndex
CREATE INDEX "characters_campaignId_idx" ON "characters"("campaignId");

-- CreateIndex
CREATE INDEX "characters_isActive_idx" ON "characters"("isActive");

-- CreateIndex
CREATE INDEX "characters_level_idx" ON "characters"("level");

-- CreateIndex
CREATE INDEX "game_sessions_campaignId_idx" ON "game_sessions"("campaignId");

-- CreateIndex
CREATE INDEX "game_sessions_gmId_idx" ON "game_sessions"("gmId");

-- CreateIndex
CREATE INDEX "game_sessions_status_idx" ON "game_sessions"("status");

-- CreateIndex
CREATE INDEX "game_sessions_scheduledAt_idx" ON "game_sessions"("scheduledAt");

-- CreateIndex
CREATE INDEX "game_sessions_status_scheduledAt_idx" ON "game_sessions"("status", "scheduledAt");

-- CreateIndex
CREATE INDEX "users_isActive_idx" ON "users"("isActive");

-- CreateIndex
CREATE INDEX "users_lastLoginAt_idx" ON "users"("lastLoginAt");

-- CreateIndex
CREATE INDEX "users_createdAt_idx" ON "users"("createdAt");
