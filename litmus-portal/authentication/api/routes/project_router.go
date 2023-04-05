package routes

import (
	"litmus/litmus-portal/authentication/api/handlers/rest"
	"litmus/litmus-portal/authentication/api/middleware"
	"litmus/litmus-portal/authentication/pkg/services"

	"github.com/gin-gonic/gin"
)

// ProjectRouter creates all the required routes for project related purposes.
func ProjectRouter(router *gin.Engine, service services.ApplicationService) {
	router.Use(middleware.JwtMiddleware())
	router.GET("/get_project/:project_id", rest.GetProject(service))
	router.GET("/get_user_with_project/:username", rest.GetUserWithProject(service))
	router.GET("/get_owner_projects", rest.GetOwnerProjectIDs(service))
	router.GET("/get_project_role/:project_id", rest.GetProjectRole(service))
	router.GET("/list_projects", rest.GetProjectsByUserID(service))
	router.GET("/get_projects_stats", rest.GetProjectStats(service))
	router.POST("/create_project", rest.CreateProject(service))
	router.POST("/send_invitation", rest.SendInvitation(service))
	router.POST("/accept_invitation", rest.AcceptInvitation(service))
	router.POST("/decline_invitation", rest.DeclineInvitation(service))
	router.POST("/remove_invitation", rest.RemoveInvitation(service))
	router.POST("/leave_project", rest.LeaveProject(service))
	router.POST("/update_projectname", rest.UpdateProjectName(service))
	// DASH
	router.POST("/add_default_member", rest.AddToDefaultProject(service))
	router.POST("/add_project_member", rest.AddProjectMember(service))
	router.POST("/create_project_fk", rest.CreateProjectFK(service))
	router.GET("/get_default_project", rest.GetDefaultProjectId(service))
}
