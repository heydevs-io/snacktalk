package core

import (
	"context"
	"fmt"
	"log"
	"net/url"
	"strings"

	novu "github.com/novuhq/go-novu/lib"
)

const ApiKey = "737186c3a9ae8310ebe39e129f8afd47"

type SubscriberResponse struct {
	Data interface{} `json:"data"`
}

func IdentifyUser(ctx context.Context, user *User) error {
	backendURL, err := url.Parse("https://novu-api.tscout.ai")
	if err != nil {
		log.Fatalf("Failed to parse URL: %v", err)
	}

	novuClient := novu.NewAPIClient(ApiKey, &novu.Config{
		BackendURL: backendURL,
	})

	// Check if the subscriber already exists
	_, err = novuClient.SubscriberApi.Get(ctx, user.ID.String())

	if err != nil {
		if strings.Contains(err.Error(), "status code 404") {

			phone := ""
			if user.PhoneCode != "" && user.PhoneNumber != "" {
				phone = user.PhoneCode + user.PhoneNumber
			}

			data := map[string]interface{}{
				"email":     user.Email,
				"firstName": user.Username,
				"phone":     phone,
			}

			subscriber, err := novuClient.SubscriberApi.Identify(ctx, user.ID.String(), data)
			if err != nil {
				return fmt.Errorf("failed to identify subscriber: %w", err)
			}
			fmt.Println(">>> subscriber", subscriber)
			fmt.Println(123)
		} else {
			return fmt.Errorf("failed to get subscriber: %w", err)
		}
	}

	return nil
}

func HandleSendOtp(ctx context.Context, user *User, otp string) error {
	IdentifyUser(ctx, user)

	backendURL, err := url.Parse("https://novu-api.tscout.ai")
	if err != nil {
		log.Fatalf("Failed to parse URL: %v", err)
	}

	novuClient := novu.NewAPIClient(ApiKey, &novu.Config{
		BackendURL: backendURL,
	})

	to := map[string]interface{}{
		"subscriberId": user.ID,
		"email":        user.Email,
	}

	payload := map[string]interface{}{
		"userName": user.Username,
		"otp":      otp,
	}

	data := novu.ITriggerPayloadOptions{To: to, Payload: payload}

	_, err = novuClient.EventApi.Trigger(ctx, "send-otp", data)

	if err != nil {
		return fmt.Errorf("failed to send otp: %w", err)
	}

	return nil
}
